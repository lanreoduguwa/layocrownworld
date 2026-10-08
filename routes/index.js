const router = require('express').Router();
const { notFoundApi } = require('../middleware/errorHandler');

router.use(require('./config'));
router.use(require('./auth'));
router.use(require('./products'));
router.use(require('./videos'));
router.use(require('./owner'));
router.use(notFoundApi);   // any other /api address

module.exports = router;
