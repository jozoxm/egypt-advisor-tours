'use strict';

const provider = {
  name: 'file',
  isConfigured() {
    return true;
  },
  getAdminConfig() {
    return {
      mode: 'offline',
      provider: 'file',
    };
  },
  async read(key, options = {}) {
    if (typeof options.localRead !== 'function') {
      return { found: false, reason: 'LOCAL_READ_UNAVAILABLE' };
    }

    const data = options.localRead(key);
    if (!data) {
      return { found: false, reason: 'LOCAL_CONTENT_NOT_FOUND' };
    }

    return { found: true, data };
  },
  async write(key, data, options = {}) {
    if (typeof options.localWrite !== 'function') {
      return {
        persisted: false,
        provider: 'file',
        reason: 'LOCAL_WRITE_UNAVAILABLE',
      };
    }

    return {
      persisted: Boolean(options.localWrite(key, data)),
      provider: 'file',
      reason: 'Failed to write local content file',
    };
  },
  async health() {
    return {
      ok: true,
      provider: 'file',
    };
  },
};

module.exports = provider;
