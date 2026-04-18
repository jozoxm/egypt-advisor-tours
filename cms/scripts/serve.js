'use strict';
/**
 * Cross-platform wrapper for `next dev` / `next start`.
 *
 * Usage (via npm scripts):
 *   node scripts/serve.js dev    → next dev   --port <CMS_PORT|3001>
 *   node scripts/serve.js start  → next start --port <CMS_PORT|3001>
 *
 * Windows CMD/PowerShell cannot expand `${CMS_PORT:-3001}` bash syntax.
 * This script reads the env var in Node.js itself, making it cross-platform.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const port = process.env.CMS_PORT || '3001';
const cmd = process.argv[2]; // 'dev' or 'start'

if (!cmd) {
  console.error('Usage: node scripts/serve.js <dev|start>');
  process.exit(1);
}

const cmsDir = path.resolve(__dirname, '..');

// Resolve the Next.js CLI entry point directly so we can run it with the
// current Node.js executable — works on Windows, macOS, and Linux without
// relying on shell-specific PATH expansion or .cmd shims.
const nextCli = require.resolve('next/dist/bin/next', { paths: [cmsDir] });

const result = spawnSync(process.execPath, [nextCli, cmd, '--port', port], {
  stdio: 'inherit',
  cwd: cmsDir,
  env: process.env,
});

process.exit(result.status ?? 1);
