// Entry point for Hostinger and other Node.js hosting providers.
// This file allows the server to be started with `node index.js` from the
// project root, which is the conventional location most hosting providers
// auto-detect as the startup file.
//
// The app is also exported so that Phusion Passenger-based hosts (including
// some Hostinger plans) can pick up the Express instance directly rather than
// relying solely on the app.listen() call inside server/index.js.
module.exports = require('./server/index.js');
