// ============================================================================
// nodejs/start.js — Hostinger .builds/current/nodejs/ entrypoint shim
// ============================================================================
// Hostinger's LiteSpeed Node.js wrapper (lsnode.js) sets LSNODE_ROOT to
// `.builds/current/nodejs/` and loads `start.js` from there. This shim
// exists solely so the wrapper can find an entrypoint; it then delegates
// to the real `start.js` at the repository root.
// ============================================================================

const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..');

if (!fs.existsSync(path.join(REPO_ROOT, 'server', 'index.js'))) {
  console.error('[nodejs-start] ERROR: Cannot find server/index.js at', REPO_ROOT);
  process.exit(1);
}

process.chdir(REPO_ROOT);

require(path.join(REPO_ROOT, 'start.js'));
