// Express 4 does not catch errors thrown in async routes, so this passes them to the error handler.
module.exports = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
