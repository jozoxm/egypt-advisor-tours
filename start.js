'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');

const ROOT_DIR = __dirname;
const CMS_DIR = path.join(ROOT_DIR, 'cms');
const CMS_LOG_FILE = path.join(ROOT_DIR, 'cms.log');
const CMS_PID_FILE = path.join(ROOT_DIR, 'cms.pid');
const MIN_KILLABLE_PID = 2;
const getCurrentTimestamp = () => new Date().toISOString();

let cmsStartMode = null;
let shuttingDown = false;

// Escapes a value for safe single-argument interpolation in a bash command by
// wrapping it in single quotes and escaping embedded quotes.
function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function assertSafePath(name, value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} must be a non-empty path`);
  }
  if (!path.isAbsolute(value)) {
    throw new Error(`${name} must be an absolute path`);
  }
  if (value.includes('\n') || value.includes('\r')) {
    throw new Error(`${name} contains invalid characters`);
  }
  return value;
}

function logStartup(level, message) {
  const logger =
    level === 'error'
      ? console.error
      : level === 'warn'
        ? console.warn
        : console.log;
  logger(`[startup ${getCurrentTimestamp()}] ${message}`);
}

async function verifyCmsProcessStability(
  runtimeEnv,
  { checks = 2, intervalMs = 500 } = {}
) {
  for (let i = 0; i < checks; i += 1) {
    if (!isCmsProcessRunning(runtimeEnv)) return false;
    if (i < checks - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  return true;
}

// Extracts the background PID from the final line of shell output (`echo $!`).
function extractPidFromShellOutput(output) {
  const pid = Number(String(output || '').trim().split('\n').pop());
  if (!Number.isFinite(pid) || pid < MIN_KILLABLE_PID) {
    throw new Error('CMS started with nohup but no valid PID was returned');
  }
  return pid;
}

function loadEnvironment() {
  dotenv.config({ path: path.join(ROOT_DIR, '.env') });
}

function buildRuntimeEnv(sourceEnv = process.env) {
  const runtimeEnv = { ...sourceEnv };

  runtimeEnv.PORT = runtimeEnv.PORT || '5000';
  runtimeEnv.CMS_PORT = runtimeEnv.CMS_PORT || '3001';
  runtimeEnv.CMS_PM2_NAME = runtimeEnv.CMS_PM2_NAME || 'egypt-cms';
  runtimeEnv.CMS_URL = runtimeEnv.CMS_URL || `http://localhost:${runtimeEnv.CMS_PORT}`;
  runtimeEnv.PAYLOAD_SERVER_URL =
    runtimeEnv.PAYLOAD_SERVER_URL || `http://localhost:${runtimeEnv.PORT}`;
  runtimeEnv.DATABASE_PATH =
    runtimeEnv.DATABASE_PATH || path.join(ROOT_DIR, 'data', 'payload.db');
  runtimeEnv.CMS_READY_TIMEOUT_MS = runtimeEnv.CMS_READY_TIMEOUT_MS || '120000';

  return runtimeEnv;
}

function validateRuntimeEnv(env = process.env) {
  const required = ['PAYLOAD_SECRET', 'DATABASE_PATH', 'CMS_URL'];
  const missing = required.filter((key) => !String(env[key] || '').trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(
        ', '
      )}. Please set them before starting production services.`
    );
  }

  assertSafePath('DATABASE_PATH', env.DATABASE_PATH);

  try {
    const parsed = new URL(env.CMS_URL);
    if (!parsed.protocol || !parsed.hostname) {
      throw new Error('CMS_URL must include protocol and hostname');
    }
  } catch (error) {
    throw new Error(`CMS_URL is invalid: ${error.message}`);
  }
}

function runCommand(command, args, env) {
  if (command !== 'pm2' && command !== 'bash') {
    throw new Error(`Unsupported command: ${command}`);
  }

  const commandEnv = {
    ...env,
    PATH: process.env.PATH,
  };

  return spawnSync(command, args, {
    cwd: ROOT_DIR,
    env: commandEnv,
    stdio: 'pipe',
    encoding: 'utf8',
  });
}

function hasPm2(env) {
  const result = runCommand('pm2', ['--version'], env);
  return result.status === 0;
}

function ensureDatabaseDirectory(env) {
  const dbPath = env.DATABASE_PATH;
  if (!dbPath) return;
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });
}

// Makes a single HTTP/HTTPS GET to cmsUrl; resolves with the HTTP status code
// or rejects on network / timeout error.
function probeCmsOnce(cmsUrl, requestTimeoutMs) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(cmsUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.get(cmsUrl, { timeout: requestTimeoutMs }, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on('timeout', () => {
      req.destroy(new Error(`CMS probe timed out after ${requestTimeoutMs}ms`));
    });
    req.on('error', reject);
  });
}

// Polls cmsUrl until it returns any HTTP response or the overall deadline is
// reached.  Rejects when the deadline passes without a successful response.
async function waitForCms(cmsUrl, { pollIntervalMs = 2000, timeoutMs = 120000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  logStartup('info', 'Waiting for CMS readiness probe...');

  while (Date.now() < deadline) {
    try {
      const remaining = deadline - Date.now();
      const status = await probeCmsOnce(cmsUrl, Math.min(5000, remaining));
      logStartup('info', `CMS is ready (HTTP ${status})`);
      return;
    } catch (_err) {
      // CMS not up yet — wait before retrying
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await new Promise((r) => setTimeout(r, Math.min(pollIntervalMs, remaining)));
  }

  throw new Error(`CMS did not become ready within ${timeoutMs}ms`);
}

function stopCmsViaPm2(env) {
  const describe = runCommand('pm2', ['describe', env.CMS_PM2_NAME], env);
  if (describe.status !== 0) return;

  const result = runCommand('pm2', ['delete', env.CMS_PM2_NAME], env);
  if (result.status !== 0) {
    console.warn('[startup] Failed to stop CMS via PM2');
  }
}

function startCmsViaPm2(env) {
  const describe = runCommand('pm2', ['describe', env.CMS_PM2_NAME], env);
  let result;

  if (describe.status === 0) {
    result = runCommand('pm2', ['restart', env.CMS_PM2_NAME, '--update-env'], env);
  } else {
    result = runCommand(
      'pm2',
      ['start', 'npm', '--name', env.CMS_PM2_NAME, '--cwd', CMS_DIR, '--', 'run', 'start'],
      env
    );
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Unable to start CMS with PM2');
  }

  cmsStartMode = 'pm2';
  logStartup('info', 'CMS started with PM2.');
}

function stopCmsViaPidFile() {
  if (!fs.existsSync(CMS_PID_FILE)) return;

  let rawPid;
  try {
    rawPid = fs.readFileSync(CMS_PID_FILE, 'utf8').trim();
  } catch (error) {
    console.warn('[startup] Failed to read CMS pid file:', error.message);
    fs.rmSync(CMS_PID_FILE, { force: true });
    return;
  }

  if (!rawPid) {
    fs.rmSync(CMS_PID_FILE, { force: true });
    return;
  }

  const pid = Number(rawPid);
  if (!Number.isFinite(pid) || pid < MIN_KILLABLE_PID) {
    fs.rmSync(CMS_PID_FILE, { force: true });
    return;
  }

  try {
    process.kill(pid, 'SIGTERM');
  } catch (error) {
    if (error.code !== 'ESRCH') {
      console.warn('[startup] Failed to stop CMS process:', error.message);
    }
  }

  fs.rmSync(CMS_PID_FILE, { force: true });
}

function startCmsViaNohup(env) {
  const cmsDir = assertSafePath('CMS_DIR', CMS_DIR);
  const cmsLogFile = assertSafePath('CMS_LOG_FILE', CMS_LOG_FILE);
  const command = [
    'set -e',
    `cd ${shellEscape(cmsDir)}`,
    `nohup npm run start >> ${shellEscape(cmsLogFile)} 2>&1 &`,
    'echo $!',
  ].join('; ');
  const result = runCommand('bash', ['-c', command], env);

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Unable to start CMS with nohup');
  }

  const pid = extractPidFromShellOutput(result.stdout);

  try {
    fs.writeFileSync(CMS_PID_FILE, `${pid}\n`, 'utf8');
    cmsStartMode = 'nohup';
    logStartup('info', 'CMS started with nohup.');
  } catch (error) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch (killError) {
      if (killError.code !== 'ESRCH') {
        console.warn('[startup] Failed to stop orphaned CMS process:', killError.message);
      }
    }
    throw error;
  }
}

function stopCms(runtimeEnv) {
  if (cmsStartMode === 'pm2') {
    stopCmsViaPm2(runtimeEnv);
  } else if (cmsStartMode === 'nohup') {
    stopCmsViaPidFile();
  }
  cmsStartMode = null;
}

function isCmsProcessRunning(runtimeEnv) {
  if (cmsStartMode === 'pm2') {
    return runCommand('pm2', ['describe', runtimeEnv.CMS_PM2_NAME], runtimeEnv).status === 0;
  }

  if (cmsStartMode === 'nohup') {
    if (!fs.existsSync(CMS_PID_FILE)) return false;
    const pid = Number(fs.readFileSync(CMS_PID_FILE, 'utf8').trim());
    if (!Number.isFinite(pid) || pid < MIN_KILLABLE_PID) return false;
    try {
      process.kill(pid, 0);
      return true;
    } catch (_error) {
      return false;
    }
  }

  return false;
}

function registerShutdownHandlers(runtimeEnv) {
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logStartup('info', `Received shutdown signal (${signal}). Stopping services...`);
    let exitCode = 0;

    try {
      stopCms(runtimeEnv);
    } catch (error) {
      exitCode = 1;
      console.error(
        `[startup ${getCurrentTimestamp()}] Error while stopping CMS:`,
        error && error.message ? error.message : String(error)
      );
    } finally {
      process.exit(exitCode);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

async function start() {
  loadEnvironment();
  const runtimeEnv = buildRuntimeEnv(process.env);
  Object.assign(process.env, runtimeEnv);

  if (process.env.NODE_ENV === 'production') {
    validateRuntimeEnv(runtimeEnv);
    logStartup('info', 'Validated production CMS environment variables.');
  } else if (!process.env.PAYLOAD_SECRET) {
    logStartup('warn', 'PAYLOAD_SECRET is not set. It must be configured in production.');
  }

  ensureDatabaseDirectory(runtimeEnv);
  logStartup('info', 'Ensured CMS database directory exists.');

  try {
    const maxStartupAttempts = 2;
    for (let attempt = 1; attempt <= maxStartupAttempts; attempt += 1) {
      logStartup('info', `Starting CMS (attempt ${attempt}/${maxStartupAttempts})`);

      if (hasPm2(runtimeEnv)) {
        startCmsViaPm2(runtimeEnv);
      } else {
        startCmsViaNohup(runtimeEnv);
      }

      try {
        await waitForCms(runtimeEnv.CMS_URL, {
          timeoutMs: Number(runtimeEnv.CMS_READY_TIMEOUT_MS) || 120000,
        });

        const processStable = await verifyCmsProcessStability(runtimeEnv);
        if (!processStable) {
          throw new Error(
            'CMS responded to health probes but process exited immediately after startup'
          );
        }

        logStartup('info', 'CMS startup verification passed');
        break;
      } catch (error) {
        const canRetry = attempt < maxStartupAttempts;
        logStartup(
          'warn',
          `CMS startup attempt ${attempt} failed.${canRetry ? ' Restarting CMS once more.' : ''}`
        );
        stopCms(runtimeEnv);
        if (!canRetry) throw error;
      }
    }

    registerShutdownHandlers(runtimeEnv);
    logStartup('info', 'Starting Express server after CMS health verification');
    require('./server/index.js');
  } catch (error) {
    logStartup('error', 'Failed to initialize services.');
    logStartup(
      'error',
      `Troubleshooting hints: verify PAYLOAD_SECRET, DATABASE_PATH write access, CMS_URL reachability, and run "npm run build --prefix cms" on the host.`
    );
    stopCms(runtimeEnv);
    throw error;
  }
}

if (require.main === module) {
  start().catch(() => {
    console.error(`[startup ${getCurrentTimestamp()}] Fatal error.`);
    process.exit(1);
  });
}

module.exports = {
  start,
  buildRuntimeEnv,
  loadEnvironment,
  waitForCms,
  validateRuntimeEnv,
};
