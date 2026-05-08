'use strict';

const path = require('path');
const dotenv = require('dotenv');

const ROOT_DIR = __dirname;

function loadEnvironment() {
  dotenv.config({ path: path.join(ROOT_DIR, '.env') });
}

function buildRuntimeEnv(sourceEnv = process.env) {
  return {
    ...sourceEnv,
    PORT: sourceEnv.PORT || '5000',
    STORYBLOK_REGION: sourceEnv.STORYBLOK_REGION || 'eu',
    STORYBLOK_EDITOR_URL:
      sourceEnv.STORYBLOK_EDITOR_URL ||
      (sourceEnv.STORYBLOK_SPACE_ID
        ? `https://app.storyblok.com/#/me/spaces/${sourceEnv.STORYBLOK_SPACE_ID}/content/`
        : 'https://app.storyblok.com/'),
  };
}

function validateRuntimeEnv(env = process.env) {
  if (env.NODE_ENV === 'production' && !env.STORYBLOK_PREVIEW_TOKEN) {
    throw new Error('STORYBLOK_PREVIEW_TOKEN is required in production');
  }

  if (env.STORYBLOK_EDITOR_URL) {
    try {
      const parsed = new URL(env.STORYBLOK_EDITOR_URL);
      if (!parsed.protocol || !parsed.hostname) {
        throw new Error('STORYBLOK_EDITOR_URL must include protocol and hostname');
      }
    } catch (error) {
      throw new Error(`STORYBLOK_EDITOR_URL is invalid: ${error.message}`);
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
