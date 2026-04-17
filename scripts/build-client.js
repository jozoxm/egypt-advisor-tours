/**
 * build-client.js
 *
 * Runs automatically after `npm install` (via the "postinstall" hook in the
 * root package.json).  This covers hosting providers like Hostinger that run
 * `npm install` on each deployment but do NOT run a separate build command —
 * without this the React frontend would be missing (gitignored build/ directory is
 * absent from a fresh clone) and every page request would return 404.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const clientDir = path.join(ROOT, 'client');
const clientBuildDir = path.join(clientDir, 'build');
const clientPublicHtaccess = path.join(clientDir, 'public', '.htaccess');
const rootBuildDir = path.join(ROOT, 'build');

// Skip only when explicitly in development mode or when opted out.
const isDevelopment = process.env.NODE_ENV === 'development';
const skipBuild = process.env.SKIP_CLIENT_BUILD === '1';

if (isDevelopment || skipBuild) {
    process.exit(0);
}

console.log('[postinstall] Building React client for production...');

try {
    // Install client dependencies
    console.log('[postinstall] Installing client dependencies...');
    execSync('npm install --prefix client --silent', { stdio: 'inherit', cwd: ROOT });
    
    // Build the React client
    console.log('[postinstall] Building React client...');
    execSync('npm run build --prefix client', {
        stdio: 'inherit',
        cwd: ROOT,
    });
    
    // Verify client build output exists
    if (!fs.existsSync(clientBuildDir)) {
        throw new Error(`Client build directory not found at ${clientBuildDir}`);
    }

    // CRA doesn't guarantee hidden files (like .htaccess) are copied from
    // client/public to client/build, so copy it explicitly when present.
    if (fs.existsSync(clientPublicHtaccess)) {
        const clientBuildHtaccess = path.join(clientBuildDir, '.htaccess');
        fs.copyFileSync(clientPublicHtaccess, clientBuildHtaccess);
    }
    
    console.log('[postinstall] Copying build output to root directory...');
    
    // Remove old root build directory if it exists
    if (fs.existsSync(rootBuildDir)) {
        fs.rmSync(rootBuildDir, { recursive: true, force: true });
    }
    
    // Create root build directory
    fs.mkdirSync(rootBuildDir, { recursive: true });
    
    // Copy client build to root build directory recursively
    copyDirSync(clientBuildDir, rootBuildDir);
    
    // Verify root build directory was created with files
    if (!fs.existsSync(rootBuildDir) || fs.readdirSync(rootBuildDir).length === 0) {
        throw new Error(`Failed to copy build output to ${rootBuildDir}`);
    }
    
    console.log('[postinstall] React client built successfully.');
} catch (err) {
    console.error('[postinstall] ERROR: React client build failed:', err.message);
    console.error('[postinstall] Failing deployment because the frontend build is required for this target.');
    process.exit(1);
}

/**
 * Recursively copy a directory using Node.js fs
 */
function copyDirSync(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
