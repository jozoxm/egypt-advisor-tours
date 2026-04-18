// Entry point for Hostinger and other Node.js hosting providers.
// Hostinger auto-detects index.js as the startup file, so this delegates to
// the production starter that launches both the CMS and the Express server.
const { start } = require('./start');

if (require.main === module) {
  start();
} else {
  module.exports = require('./server/index.js');
}
