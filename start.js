'use strict';

const path = require('path');
const dotenv = require('dotenv');
const { DEFAULT_WORDPRESS_BASE_URL } = require('./server/cms-config');

const ROOT_DIR = __dirname;

function loadEnvironment() {
  dotenv.config({ path: path.join(ROOT_DIR, '.env') });
}

function buildRuntimeEnv(sourceEnv = process.env) {
  const cmsProvider = (sourceEnv.CMS_PROVIDER || 'auto').toLowerCase();
  return {
    ...sourceEnv,
    PORT: sourceEnv.PORT || '5000',
    CMS_PROVIDER: cmsProvider,
    WORDPRESS_BASE_URL:
      sourceEnv.WORDPRESS_BASE_URL ||
      (cmsProvider === 'wordpress' ? DEFAULT_WORDPRESS_BASE_URL : ''),
    STORYBLOK_REGION: sourceEnv.STORYBLOK_REGION || 'eu',
    STORYBLOK_EDITOR_URL:
      sourceEnv.STORYBLOK_EDITOR_URL ||
      (sourceEnv.STORYBLOK_SPACE_ID
        ? `https://app.storyblok.com/#/me/spaces/${sourceEnv.STORYBLOK_SPACE_ID}/content/`
        : 'https://app.storyblok.com/'),
  };
}

function validateRuntimeEnv(env = process.env) {
  const cmsProvider = String(env.CMS_PROVIDER || 'auto').toLowerCase();

  if (env.NODE_ENV === 'production' && cmsProvider === 'storyblok' && !env.STORYBLOK_PREVIEW_TOKEN) {
    throw new Error('STORYBLOK_PREVIEW_TOKEN is required in production');
  }

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
