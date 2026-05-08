'use strict';

const fs = require('fs');

const mockStore = {};

function loadSeedData(seedPath) {
  if (!seedPath || !fs.existsSync(seedPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(seedPath, 'utf8');
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

const provider = {
  name: 'mock',
  isConfigured() {
    return true;
  },
  getAdminConfig() {
    return {
      mode: 'offline',
      provider: 'mock',
    };
  },
  async read(key, options = {}) {
    if (!(key in mockStore)) {
      const seeded = loadSeedData((options.env || process.env).CMS_MOCK_SEED_PATH);
      if (seeded && seeded[key] !== undefined) {
        mockStore[key] = seeded[key];
      } else if (typeof options.localRead === 'function') {
        const fallback = options.localRead(key);
        if (fallback !== null && fallback !== undefined) {
          mockStore[key] = fallback;
        }
      }
    }

    if (!(key in mockStore)) {
      return { found: false, reason: 'MOCK_CONTENT_NOT_FOUND' };
    }

    return { found: true, data: mockStore[key] };
  },
  async write(key, data) {
    mockStore[key] = data;
    return {
      persisted: true,
      provider: 'mock',
      mock: true,
    };
  },
  async health() {
    return {
      ok: true,
      provider: 'mock',
    };
  },
};

module.exports = provider;
