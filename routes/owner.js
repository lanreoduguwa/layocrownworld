const router = require('express').Router();
const requireAdmin = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');
const { update } = require('../controllers/ownerController');

router.post('/admin/owner', requireAdmin, imageUpload.single('image'), asyncHandler(update));

module.exports = router;
