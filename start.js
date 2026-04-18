'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');

const ROOT_DIR = __dirname;
const CMS_DIR = path.join(ROOT_DIR, 'cms');
const CMS_LOG_FILE = path.join(ROOT_DIR, 'cms.log');
const CMS_PID_FILE = path.join(ROOT_DIR, 'cms.pid');
const MIN_KILLABLE_PID = 2;

let cmsStartMode = null;
let shuttingDown = false;

// Escapes a value for safe single-argument interpolation in a bash command.
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

function extractPidFromShellOutput(output) {
  return Number(String(output || '').trim().split('\n').pop());
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

  return runtimeEnv;
}

function runCommand(command, args, env) {
  return spawnSync(command, args, {
    cwd: ROOT_DIR,
    env,
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
  console.log('[startup] CMS started with PM2');
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
    `cd ${shellEscape(cmsDir)}`,
    `nohup npm run start >> ${shellEscape(cmsLogFile)} 2>&1 &`,
    'echo $!',
  ].join(' && ');
  const result = runCommand('bash', ['-lc', command], env);

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Unable to start CMS with nohup');
  }

  const pid = extractPidFromShellOutput(result.stdout);
  if (!Number.isFinite(pid) || pid < MIN_KILLABLE_PID) {
    throw new Error('CMS started with nohup but no valid PID was returned');
  }

  try {
    fs.writeFileSync(CMS_PID_FILE, `${pid}\n`, 'utf8');
    cmsStartMode = 'nohup';
    console.log(`[startup] CMS started with nohup (PID ${pid})`);
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
}

function registerShutdownHandlers(runtimeEnv) {
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[startup] Received ${signal}. Stopping services...`);
    let exitCode = 0;

    try {
      stopCms(runtimeEnv);
    } catch (error) {
      exitCode = 1;
      console.error('[startup] Error while stopping CMS:', error.stack || error);
    } finally {
      process.exit(exitCode);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

function start() {
  loadEnvironment();
  const runtimeEnv = buildRuntimeEnv(process.env);
  Object.assign(process.env, runtimeEnv);

  if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('PAYLOAD_SECRET is required in production');
  }

  if (!process.env.PAYLOAD_SECRET) {
    console.warn('[startup] PAYLOAD_SECRET is not set. It must be configured in production.');
  }

  ensureDatabaseDirectory(runtimeEnv);

  try {
    if (hasPm2(runtimeEnv)) {
      startCmsViaPm2(runtimeEnv);
    } else {
      startCmsViaNohup(runtimeEnv);
    }

    registerShutdownHandlers(runtimeEnv);
    require('./server/index.js');
  } catch (error) {
    console.error('[startup] Failed to initialize services:', error.stack || error);
    stopCms(runtimeEnv);
    throw error;
  }
}

if (require.main === module) {
  start();
}

module.exports = {
  start,
  buildRuntimeEnv,
  loadEnvironment,
};
