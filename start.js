'use strict';

const path = require('path');

let dotenv;
try {
  dotenv = require('dotenv');
} catch (_) {
  // dotenv is optional at runtime; will be missing in some test environments
  dotenv = { config: () => {} };
}

const ROOT_DIR = __dirname;

function loadEnvironment() {
  dotenv.config({ path: path.join(ROOT_DIR, '.env') });
}

function buildRuntimeEnv(sourceEnv = process.env) {
  return {
    ...sourceEnv,
    PORT: sourceEnv.PORT || '5000',
    WORDPRESS_BASE_URL:
      sourceEnv.WORDPRESS_BASE_URL || 'https://cms.egyptadvisortours.com',
  };
}

function validateRuntimeEnv(env = process.env) {
  if (env.WORDPRESS_BASE_URL) {
    try {
      const parsed = new URL(env.WORDPRESS_BASE_URL);
      if (!parsed.protocol || !parsed.hostname) {
        throw new Error('WORDPRESS_BASE_URL must include protocol and hostname');
      }
    } catch (error) {
      throw new Error(`WORDPRESS_BASE_URL is invalid: ${error.message}`);
    }
  }
}

async function start() {
  loadEnvironment();
  const runtimeEnv = buildRuntimeEnv(process.env);
  Object.assign(process.env, runtimeEnv);
  validateRuntimeEnv(runtimeEnv);
  require('./server/index.js');
}

if (require.main === module) {
  start().catch((err) => {
    console.error('[startup] Fatal error:', err.stack || err);
    process.exit(1);
  });
}

module.exports = {
  start,
  buildRuntimeEnv,
  loadEnvironment,
  validateRuntimeEnv,
};
