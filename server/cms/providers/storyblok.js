'use strict';

const {
  fetchStoryblokResource,
  getStoryblokAdminUrl,
  getStoryblokVersion,
  isStoryblokConfigured,
  updateStoryblokResource,
} = require('../../storyblok');

const provider = {
  name: 'storyblok',
  isConfigured(env = process.env) {
    return isStoryblokConfigured(env);
  },
  getAdminConfig(env = process.env) {
    return {
      mode: 'iframe',
      provider: 'storyblok',
      url: getStoryblokAdminUrl(env),
    };
  },
  async read(key, options = {}) {
    const env = options.env || process.env;
    if (!isStoryblokConfigured(env)) {
      return { found: false, reason: 'STORYBLOK_NOT_CONFIGURED' };
    }

    const data = await fetchStoryblokResource(key, {
      source: options.source,
      env,
      version: options.version,
      cv: options.cv,
    });

    if (!data) {
      return { found: false, reason: 'STORYBLOK_NOT_FOUND' };
    }

    return { found: true, data };
  },
  async write(key, data, options = {}) {
    const env = options.env || process.env;
    if (!isStoryblokConfigured(env)) {
      return {
        persisted: false,
        provider: 'storyblok',
        reason: 'STORYBLOK_NOT_CONFIGURED',
      };
    }

    const result = await updateStoryblokResource(key, data, env);
    if (result.persisted) {
      return {
        persisted: true,
        provider: 'storyblok',
      };
    }

    return {
      persisted: false,
      provider: 'storyblok',
      reason: result.reason || 'Storyblok write failed',
    };
  },
  async health(options = {}) {
    const env = options.env || process.env;
    const source = options.source || {};

    if (!isStoryblokConfigured(env)) {
      return {
        ok: false,
        provider: 'storyblok',
        errorCode: 'STORYBLOK_NOT_CONFIGURED',
        hint: 'Set STORYBLOK_PREVIEW_TOKEN (and optionally STORYBLOK_SPACE_ID / STORYBLOK_MANAGEMENT_TOKEN).',
      };
    }

    try {
      await fetchStoryblokResource('settings', {
        source,
        env,
        version: getStoryblokVersion(source),
      });

      return {
        ok: true,
        provider: 'storyblok',
        version: getStoryblokVersion(source),
      };
    } catch (error) {
      return {
        ok: false,
        provider: 'storyblok',
        errorCode: error.code || error.message,
        hint: 'Verify STORYBLOK_PREVIEW_TOKEN, STORYBLOK_REGION, and the configured Storyblok story slugs.',
      };
    }
  },
};

module.exports = provider;
