'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');

const ROOT_DIR = __dirname;
const CMS_DIR = path.join(ROOT_DIR, 'cms');
const CMS_LOG_FILE = path.join(ROOT_DIR, 'cms.log');
const CMS_PID_FILE = path.join(ROOT_DIR, 'cms.pid');
const CMS_PM2_NAME = process.env.CMS_PM2_NAME || 'egypt-cms';

let cmsStartMode = null;
let shuttingDown = false;

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function loadEnvironment() {
  dotenv.config({ path: path.join(ROOT_DIR, '.env') });
}

function buildRuntimeEnv(sourceEnv = process.env) {
  const runtimeEnv = { ...sourceEnv };

  runtimeEnv.PORT = runtimeEnv.PORT || '5000';
  runtimeEnv.CMS_PORT = runtimeEnv.CMS_PORT || '3001';
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
  const result = runCommand('pm2', ['delete', CMS_PM2_NAME], env);
  if (result.status !== 0 && !/process or namespace .* not found/i.test(result.stderr || '')) {
    console.warn('[startup] Failed to stop CMS via PM2:', result.stderr || result.stdout);
  }
}

function startCmsViaPm2(env) {
  const describe = runCommand('pm2', ['describe', CMS_PM2_NAME], env);
  let result;

  if (describe.status === 0) {
    result = runCommand('pm2', ['restart', CMS_PM2_NAME, '--update-env'], env);
  } else {
    result = runCommand(
      'pm2',
      ['start', 'npm', '--name', CMS_PM2_NAME, '--cwd', CMS_DIR, '--', 'run', 'start'],
      env
    );
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Unable to start CMS with PM2');
  }

  cmsStartMode = 'pm2';
  console.log(`[startup] CMS started with PM2 as "${CMS_PM2_NAME}" on port ${env.CMS_PORT}`);
}

function stopCmsViaPidFile() {
  if (!fs.existsSync(CMS_PID_FILE)) return;

  const rawPid = fs.readFileSync(CMS_PID_FILE, 'utf8').trim();
  if (!rawPid) return;
  const pid = Number(rawPid);

  if (Number.isFinite(pid) && pid > 1) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch (error) {
      if (error.code !== 'ESRCH') {
        console.warn('[startup] Failed to stop CMS process:', error.message);
      }
    }
  }

  fs.rmSync(CMS_PID_FILE, { force: true });
}

function startCmsViaNohup(env) {
  const command = [
    `cd ${shellEscape(CMS_DIR)}`,
    `nohup npm run start > ${shellEscape(CMS_LOG_FILE)} 2>&1 &`,
    'echo $!',
  ].join(' && ');
  const result = runCommand('bash', ['-lc', command], env);

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Unable to start CMS with nohup');
  }

  const pid = (result.stdout || '').trim().split('\n').pop();
  if (!pid) {
    throw new Error('CMS started with nohup but no PID was returned');
  }

  fs.writeFileSync(CMS_PID_FILE, `${pid}\n`, 'utf8');
  cmsStartMode = 'nohup';
  console.log(`[startup] CMS started with nohup (PID ${pid}) on port ${env.CMS_PORT}`);
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

    try {
      stopCms(runtimeEnv);
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

function start() {
  loadEnvironment();
  const runtimeEnv = buildRuntimeEnv(process.env);
  Object.assign(process.env, runtimeEnv);

  if (!process.env.PAYLOAD_SECRET) {
    console.warn('[startup] PAYLOAD_SECRET is not set. CMS should configure this in production.');
  }

  ensureDatabaseDirectory(runtimeEnv);

  try {
    if (hasPm2(runtimeEnv)) {
      startCmsViaPm2(runtimeEnv);
    } else {
      startCmsViaNohup(runtimeEnv);
    }

    registerShutdownHandlers(runtimeEnv);
    return require('./server/index.js');
  } catch (error) {
    console.error('[startup] Failed to initialize services:', error.message);
    stopCms(runtimeEnv);
    throw error;
  }
}

if (require.main === module) {
  try {
    start();
  } catch (_error) {
    process.exit(1);
  }
}

module.exports = {
  start,
  buildRuntimeEnv,
  loadEnvironment,
};
