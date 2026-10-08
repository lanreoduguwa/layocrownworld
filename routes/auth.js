const router = require('express').Router();
const requireAdmin = require('../middleware/auth');
const loginLimiter = require('../middleware/loginLimiter');
const { login, logout, me } = require('../controllers/authController');

router.post('/admin/login', loginLimiter, login);
router.post('/admin/logout', logout);
router.get('/admin/me', requireAdmin, me);

module.exports = router;
