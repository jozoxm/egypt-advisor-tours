'use strict';

const path = require('path');
const dotenv = require('dotenv');

const ROOT_DIR = __dirname;

function loadEnvironment() {
  dotenv.config({ path: path.join(ROOT_DIR, '.env') });
}

async function start() {
  loadEnvironment();
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
};
