/**
 * build-client.js
 *
 * Runs automatically after `npm install` (via the "postinstall" hook in the
 * root package.json) when NODE_ENV is "production".  This covers hosting
 * providers like Hostinger that run `npm install` on deployment but do NOT
 * run a separate build command — without this the React frontend would be
 * missing (gitignored client/build is absent from a fresh clone) and every
 * page request would return 404.
 *
 * The script is skipped in development/CI environments unless the caller
 * explicitly sets BUILD_CLIENT=1, so local `npm install` stays fast.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const buildPath = path.join(ROOT, 'client', 'build');

// Skip only when explicitly in development mode or when opted out.
// This covers the common case where the hosting provider (e.g. Hostinger hPanel)
// does NOT set NODE_ENV=production but also doesn't set NODE_ENV=development —
// we still want the build to run on a fresh deployment in that case.
const isDevelopment = process.env.NODE_ENV === 'development';
const skipBuild = process.env.SKIP_CLIENT_BUILD === '1';

if (isDevelopment || skipBuild) {
    process.exit(0);
}

if (fs.existsSync(buildPath)) {
    // Build already present — nothing to do.
    process.exit(0);
}

console.log('[postinstall] React build not found. Building client for production...');

try {
    execSync('npm install --prefix client --silent', { stdio: 'inherit', cwd: ROOT });
    execSync('npm run build --prefix client', { stdio: 'inherit', cwd: ROOT });
    console.log('[postinstall] React client built successfully.');
} catch (err) {
    // A failed build should not prevent the server from starting — it can
    // still serve the API.  Log a clear warning so admins can investigate.
    console.warn('[postinstall] WARNING: React client build failed:', err.message);
    console.warn('[postinstall] The server will start, but the frontend will not be served.');
    console.warn('[postinstall] Fix the build error and re-run: npm run build --prefix client');
}
