const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { COOKIE_NAME } = require('../config/constants');

// Blocks a route unless the visitor has a valid admin login cookie.
module.exports = (req, res, next) => {
  try {
    jwt.verify(req.cookies[COOKIE_NAME], jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Please log in again' });
  }
};
