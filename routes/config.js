const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { getConfig } = require('../controllers/configController');

router.get('/config', asyncHandler(getConfig));

module.exports = router;
