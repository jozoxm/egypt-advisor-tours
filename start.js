// ============================================================================
// HOSTINGER REVERSE-PROXY RUNTIME PATENCY HOOK
// Primary module-resolution intercept for versioned sandbox environments.
// Hostinger's wrapper may strip NODE_PATH; this hook ensures dependencies
// like multer/sharp remain resolvable from the domain-root node_modules.
// ============================================================================
const Module = require('module');
const path = require('path');

const ACCREDITED_NODE_PATH = '/home/u239421793/domains/egyptadvisortours.com';

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  try {
    return originalResolveFilename.apply(this, arguments);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND' && !path.isAbsolute(request) && !request.startsWith('.')) {
      try {
        const absoluteFallbackPath = path.join(ACCREDITED_NODE_PATH, 'node_modules', request);
        return originalResolveFilename.call(this, absoluteFallbackPath, parent, isMain, options);
      } catch (fallbackError) {
        throw err;
      }
    }
    throw err;
  }
};
// ============================================================================
// END HOOK - STARTUP LOGIC RESUMES
// ============================================================================

'use strict';

const dotenv = require('dotenv');
const fs = require('fs');

const ROOT_DIR = __dirname;
const DOMAIN_ROOT = ROOT_DIR;

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
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminSecret = process.env.ADMIN_SECRET;
        console.log('[startup] Env diagnostics:', {
          adminUsernameLoaded: !!adminUsername,
          adminUsernameLength: adminUsername ? adminUsername.length : 0,
          adminPasswordLoaded: !!adminPassword,
          adminPasswordLength: adminPassword ? adminPassword.length : 0,
          adminSecretLoaded: !!adminSecret,
          adminSecretLength: adminSecret ? adminSecret.length : 0,
          nodeEnv: process.env.NODE_ENV || 'undefined',
          cwd: process.cwd(),
          platform: process.platform,
        });
        return;
      }
    } catch (err) {
      console.warn('[startup] Failed to load env from', envPath, ':', err.message);
    }
  }

  console.warn('[startup] No .env file found in expected locations; using defaults and process env');
}

function setupNodePath() {
  const rootNodeModules = path.join(DOMAIN_ROOT, 'node_modules');
  if (!fs.existsSync(rootNodeModules)) {
    console.warn('[startup] root/node_modules not found at', rootNodeModules);
    console.warn('[startup] Dependencies may be missing. Ensure npm ci runs in CI/CD.');
  } else {
    console.log('[startup] root/node_modules found at', rootNodeModules);
  }
  process.env.NODE_PATH = rootNodeModules;
  require('module').Module._initPaths();
  console.log('[startup] NODE_PATH set to:', process.env.NODE_PATH);
}

async function start() {
  loadEnvironment();
  setupNodePath();
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
  setupNodePath,
};