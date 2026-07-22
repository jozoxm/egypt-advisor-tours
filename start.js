'use strict';

const path = require('path');
const dotenv = require('dotenv');

const ROOT_DIR = __dirname;

function loadEnvironment() {
  dotenv.config({ path: path.join(ROOT_DIR, '.env') });
}

async function start() {
  loadEnvironment();
  const app = require('./server/index.js');

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('[startup] Server error:', err);
    process.exit(1);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error('[startup] Fatal error:', err.stack || err);
    process.exit(1);
  });
}

module.exports = {
  start,
  loadEnvironment,
};
