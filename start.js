'use strict';

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const dotenv = require('dotenv');

const ROOT_DIR = __dirname;
const CMS_DIR = path.join(ROOT_DIR, 'cms');
const CMS_LOG_FILE = path.join(ROOT_DIR, 'cms.log');
const CMS_PID_FILE = path.join(ROOT_DIR, 'cms.pid');
const CMS_PM2_NAME = process.env.CMS_PM2_NAME || 'egypt-cms';
const MIN_KILLABLE_PID = 2;

let cmsStartMode = null;
let shuttingDown = false;

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
  const describe = runCommand('pm2', ['describe', CMS_PM2_NAME], env);
  if (describe.status !== 0) return;

  const result = runCommand('pm2', ['delete', CMS_PM2_NAME], env);
  if (result.status !== 0) {
    console.warn('[startup] Failed to stop CMS via PM2');
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
  console.log(`[startup] CMS started with PM2 as "${CMS_PM2_NAME}"`);
}

function stopCmsViaPidFile() {
  if (!fs.existsSync(CMS_PID_FILE)) return;

  const rawPid = fs.readFileSync(CMS_PID_FILE, 'utf8').trim();
  if (!rawPid) return;
  const pid = Number(rawPid);

  if (Number.isFinite(pid) && pid >= MIN_KILLABLE_PID) {
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
  const logFd = fs.openSync(CMS_LOG_FILE, 'a');
  const child = spawn('nohup', ['npm', 'run', 'start'], {
    cwd: CMS_DIR,
    env,
    detached: true,
    stdio: ['ignore', logFd, logFd],
  });
  fs.closeSync(logFd);

  if (!child.pid) {
    throw new Error('CMS started with nohup but no PID was returned');
  }

  child.unref();
  const pid = String(child.pid);
  fs.writeFileSync(CMS_PID_FILE, `${pid}\n`, 'utf8');
  cmsStartMode = 'nohup';
  console.log(`[startup] CMS started with nohup (PID ${pid})`);
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
