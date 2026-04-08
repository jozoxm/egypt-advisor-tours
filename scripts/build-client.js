/**
 * build-client.js
 *
 * Runs automatically after `npm install` (via the "postinstall" hook in the
 * root package.json).  This covers hosting providers like Hostinger that run
 * `npm install` on each deployment but do NOT run a separate build command —
 * without this the React frontend would be missing (gitignored client/build is
 * absent from a fresh clone) and every page request would return 404.
 *
 * Smart rebuild logic (git-hash-based):
 *   - Always builds on the first deployment (no client/build directory).
 *   - Rebuilds after a code change (git HEAD has moved since the last build).
 *   - Skips the build when nothing has changed (fast Hostinger restarts).
 *   - Falls back to always rebuilding when git is unavailable.
 *
 * Override flags:
 *   SKIP_CLIENT_BUILD=1  — skip entirely (CI pipelines that build separately).
 *   NODE_ENV=development — skip (local development).
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

// --- Smart rebuild: skip when the build is already up to date ---
// Read the current git commit hash.  If git isn't available (or the project
// isn't a git repo), currentHash stays null and we always rebuild.
let currentHash = null;
try {
    currentHash = execSync('git rev-parse HEAD', {
        cwd: ROOT,
        stdio: 'pipe',
    }).toString().trim();
} catch {
    // git unavailable — fall through to unconditional rebuild.
    console.log('[postinstall] git not available; will rebuild the React client unconditionally.');
}

const buildHashFile = path.join(buildPath, 'build-hash.txt');
if (currentHash && fs.existsSync(buildPath) && fs.existsSync(buildHashFile)) {
    try {
        const storedHash = fs.readFileSync(buildHashFile, 'utf8').trim();
        if (storedHash === currentHash) {
            // Build is already up to date for this commit — nothing to do.
            process.exit(0);
        }
    } catch {
        // Can't read the hash file — fall through to rebuild.
    }
}

console.log('[postinstall] Building React client for production...');

try {
    execSync('npm install --prefix client --silent', { stdio: 'inherit', cwd: ROOT });
    execSync('npm run build --prefix client', { stdio: 'inherit', cwd: ROOT });
    // Persist the git hash so subsequent restarts with the same code skip the build.
    if (currentHash) {
        try {
            fs.writeFileSync(buildHashFile, currentHash, 'utf8');
        } catch {
            // Non-critical — the build succeeded; we just can't cache the hash.
        }
    }
    console.log('[postinstall] React client built successfully.');
} catch (err) {
    // A failed build should not prevent the server from starting — it can
    // still serve the API.  Log a clear warning so admins can investigate.
    console.warn('[postinstall] WARNING: React client build failed:', err.message);
    console.warn('[postinstall] The server will start, but the frontend will not be served.');
    console.warn('[postinstall] Fix the build error and re-run: npm run build --prefix client');
}
