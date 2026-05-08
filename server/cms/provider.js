'use strict';

const storyblokProvider = require('./providers/storyblok');
const fileProvider = require('./providers/file');
const mockProvider = require('./providers/mock');

const PROVIDERS = {
  storyblok: storyblokProvider,
  file: fileProvider,
  mock: mockProvider,
};

function normalizeProviderName(value, fallback = 'auto') {
  const normalized = String(value || fallback).trim().toLowerCase();
  if (normalized === 'auto' || PROVIDERS[normalized]) {
    return normalized;
  }
  return fallback;
}

function resolveProviderName(env = process.env) {
  const configured = normalizeProviderName(env.CMS_PROVIDER, 'auto');
  if (configured !== 'auto') {
    return configured;
  }

  return storyblokProvider.isConfigured(env) ? 'storyblok' : 'file';
}

function resolveFailoverName(primary, env = process.env) {
  const configured = normalizeProviderName(env.CMS_FAILOVER_PROVIDER, '');
  if (configured && configured !== 'auto' && configured !== primary) {
    return configured;
  }

  if (primary === 'storyblok') {
    return 'file';
  }

  return null;
}

function createCmsProviderContext(env = process.env) {
  const primaryName = resolveProviderName(env);
  const failoverName = resolveFailoverName(primaryName, env);

  const primary = PROVIDERS[primaryName] || fileProvider;
  const failover = failoverName ? PROVIDERS[failoverName] : null;

  return {
    primaryName,
    failoverName,
    isStoryblokMode() {
      return primaryName === 'storyblok';
    },
    getAdminConfig() {
      return primary.getAdminConfig(env);
    },
    async read(key, options = {}) {
      const scopedOptions = { ...options, env: options.env || env };

      try {
        const primaryResult = await primary.read(key, scopedOptions);
        if (primaryResult && primaryResult.found) {
          return {
            found: true,
            data: primaryResult.data,
            provider: primaryName,
          };
        }
      } catch (error) {
        if (!failover) {
          return { found: false, provider: primaryName, error };
        }
      }

      if (!failover) {
        return { found: false, provider: primaryName };
      }

      const failoverResult = await failover.read(key, scopedOptions);
      if (failoverResult && failoverResult.found) {
        return {
          found: true,
          data: failoverResult.data,
          provider: failoverName,
          failover: true,
        };
      }

      return {
        found: false,
        provider: primaryName,
        failoverProvider: failoverName,
      };
    },
    async write(key, data, options = {}) {
      const scopedOptions = { ...options, env: options.env || env };

      try {
        const primaryResult = await primary.write(key, data, scopedOptions);
        if (primaryResult && primaryResult.persisted) {
          return {
            ...primaryResult,
            provider: primaryResult.provider || primaryName,
          };
        }

        if (!failover) {
          return {
            persisted: false,
            provider: primaryName,
            reason: primaryResult && primaryResult.reason,
          };
        }

        const failoverResult = await failover.write(key, data, scopedOptions);
        return {
          ...failoverResult,
          provider: failoverResult.provider || failoverName,
          primaryProvider: primaryName,
          primaryError: primaryResult && primaryResult.reason,
          failover: true,
        };
      } catch (error) {
        if (!failover) {
          return {
            persisted: false,
            provider: primaryName,
            error,
          };
        }

        const failoverResult = await failover.write(key, data, scopedOptions);
        return {
          ...failoverResult,
          provider: failoverResult.provider || failoverName,
          primaryProvider: primaryName,
          primaryError: error,
          failover: true,
        };
      }
    },
    async health(options = {}) {
      const scopedOptions = { ...options, env: options.env || env };
      const primaryHealth = await primary.health(scopedOptions);
      let failoverHealth = null;

      if (failover) {
        try {
          failoverHealth = await failover.health(scopedOptions);
        } catch (error) {
          failoverHealth = {
            ok: false,
            provider: failoverName,
            errorCode: error.code || error.message,
          };
        }
      }

      return {
        primaryProvider: primaryName,
        failoverProvider: failoverName,
        primary: primaryHealth,
        failover: failoverHealth,
      };
    },
  };
}

module.exports = {
  createCmsProviderContext,
  normalizeProviderName,
  resolveProviderName,
};
