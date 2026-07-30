'use strict';

const path = require('path');
const dotenv = require('dotenv');

const ROOT_DIR = __dirname;

function loadEnvironment() {
  const candidates = [
    path.join(ROOT_DIR, '.env'),
    path.join(ROOT_DIR, '..', '.env'),
    path.join(ROOT_DIR, '..', '..', '.env'),
    path.join(ROOT_DIR, '..', '..', '..', '.env'),
    path.join(ROOT_DIR, '..', '..', '..', '..', '.env'),
  ];

  for (const envPath of candidates) {
    try {
      const result = dotenv.config({ path: envPath, override: true });
      if (!result.error) {
        console.log('[startup] Loaded environment from:', envPath);
        return;
      }
    } catch (err) {
      console.warn('[startup] Failed to load env from', envPath, ':', err.message);
    }
  }

  console.warn('[startup] No .env file found in expected locations; using defaults and process env');
}

async function start() {
  loadEnvironment();
  require('./server/index.js');
}

start()
  .then(() => {
    console.log('[startup] Server started successfully');
  })
  .catch((err) => {
    console.error('[startup] Fatal error:', err.stack || err);
    process.exit(1);
  });

module.exports = {
  start,
  loadEnvironment,
};
