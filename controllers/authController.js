const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { COOKIE_NAME, SESSION_DAYS } = require('../config/constants');

const digest = v => crypto.createHash('sha256').update(String(v ?? '')).digest();
const same = (a, b) => crypto.timingSafeEqual(digest(a), digest(b));   // constant-time compare

exports.login = (req, res) => {
  const { user, password } = req.body || {};
  const okUser = same(user, env.admin.user);
  const okPass = same(password, env.admin.password);
  if (!(okUser && okPass)) return res.status(401).json({ error: 'Wrong username or password' });

  res.cookie(COOKIE_NAME, jwt.sign({ admin: true }, env.jwtSecret, { expiresIn: `${SESSION_DAYS}d` }), {
    httpOnly: true, sameSite: 'strict', secure: env.isProd, maxAge: SESSION_DAYS * 864e5
  });
  res.json({ ok: true });
};

exports.logout = (req, res) => { res.clearCookie(COOKIE_NAME); res.json({ ok: true }); };
exports.me = (req, res) => res.json({ ok: true });
