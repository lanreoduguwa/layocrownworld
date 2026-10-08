const router = require('express').Router();
const requireAdmin = require('../middleware/auth');
const { videoUpload } = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');
const c = require('../controllers/videoController');

router.get('/videos', asyncHandler(c.list));                                                          // public
router.post('/admin/videos', requireAdmin, videoUpload.single('video'), asyncHandler(c.create));      // admin
router.delete('/admin/videos/:id', requireAdmin, asyncHandler(c.remove));

module.exports = router;
