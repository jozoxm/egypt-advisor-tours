// Entry point for Hostinger and other Node.js hosting providers.
// Hostinger auto-detects index.js as the startup file, so this delegates to
// the production starter that loads environment variables and starts Express.
const { start } = require('./start');

if (require.main === module) {
  start();
} else {
  module.exports = require('./server/index.js');
}
