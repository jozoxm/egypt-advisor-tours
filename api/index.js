// Vercel serverless entry point — wraps the Express app so Vercel can invoke it
// as a serverless function for all /api/* requests.
//
// Data persistence note: the server reads data from client/src/data/*.js on cold
// start (bundled via vercel.json "includeFiles") and writes to those files when
// possible.  On Vercel's read-only filesystem the file writes are silently skipped
// and changes are kept in the server's in-memory store for the lifetime of the
// function instance.  A new deployment resets the store from the bundled files.
module.exports = require('../server');
