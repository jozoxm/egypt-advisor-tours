/**
 * canary-deploy.js
 *
 * Simulates the production entry point inside a build context to verify
 * that all runtime dependencies resolve correctly before the build is
 * promoted to final delivery.
 *
 * Usage:
 *   node scripts/canary-deploy.js
 *
 * Exit codes:
 *   0 - All modules loaded successfully
 *   1 - One or more modules failed to load
 */

'use strict';

const path = require('path');
const fs = require('fs');

// In Hostinger's build system, the app runs from a versioned directory like:
//   /home/u.../domains/.../.builds/versions/.../nodejs/
//
// Locally, we simulate this by treating the repo root as the nodejs/ entry
// context. The critical requirement is that `require('./server/index.js')`
// succeeds without MODULE_NOT_FOUND for any runtime dependency.

const CANDIDATE_ENTRIES = [
  path.join(__dirname, '..', 'server', 'index.js'),
  path.join(__dirname, '..', 'index.js'),
];

function findEntry() {
  for (const candidate of CANDIDATE_ENTRIES) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function runCanary() {
  const entryPoint = findEntry();
  if (!entryPoint) {
    console.error('[canary] FAIL: Cannot find server entry point (server/index.js or index.js)');
    process.exit(1);
  }

  console.log(`[canary] Verifying entry point: ${entryPoint}`);

  // Verify critical runtime dependencies exist in node_modules
  const rootDir = path.resolve(__dirname, '..');
  const nodejsDir = path.join(rootDir, 'nodejs');
  const serverDir = path.join(rootDir, 'server');

  const dependencyDirs = [
    path.join(rootDir, 'node_modules'),
    path.join(nodejsDir, 'node_modules'),
    path.join(serverDir, 'node_modules'),
  ];

  const criticalModules = [
    'express',
    'multer',
    'sharp',
    'cookie-parser',
    'cors',
    'dotenv',
    'express-rate-limit',
    'helmet',
    'jsonwebtoken',
  ];

  let missing = [];
  for (const mod of criticalModules) {
    const found = dependencyDirs.some((dir) => {
      const pkgJson = path.join(dir, mod, 'package.json');
      return fs.existsSync(pkgJson);
    });
    if (!found) {
      missing.push(mod);
    }
  }

  if (missing.length > 0) {
    console.error('[canary] FAIL: Missing runtime dependencies in node_modules:');
    missing.forEach((m) => console.error(`  - ${m}`));
    console.error('[canary] Searched paths:', dependencyDirs);
    process.exit(1);
  }

  console.log('[canary] All critical dependencies found.');

  // Attempt to load the entry point
  try {
    // Clear require cache to force fresh resolution
    Object.keys(require.cache).forEach((key) => {
      if (key.includes(path.join(rootDir, 'server')) || key.includes(path.join(rootDir, 'nodejs'))) {
        delete require.cache[key];
      }
    });

    const app = require(entryPoint);
    console.log(`[canary] PASS: Entry point loaded successfully (${entryPoint})`);
    console.log('[canary] App type:', typeof app);
    process.exit(0);
  } catch (err) {
    console.error(`[canary] FAIL: Entry point crashed (${entryPoint})`);
    console.error(`[canary] Error: ${err.message}`);
    if (err.code === 'MODULE_NOT_FOUND') {
      console.error(`[canary] Missing module: ${err.requireStack?.join(' -> ') || 'unknown'}`);
    }
    console.error(err.stack);
    process.exit(1);
  }
}

runCanary();
