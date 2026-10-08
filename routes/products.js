const router = require('express').Router();
const requireAdmin = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');
const c = require('../controllers/productController');

router.get('/products', asyncHandler(c.list));                                                       // public
router.post('/admin/products', requireAdmin, imageUpload.single('image'), asyncHandler(c.create));   // admin
router.patch('/admin/products/:id/stock', requireAdmin, asyncHandler(c.toggleStock));
router.delete('/admin/products/:id', requireAdmin, asyncHandler(c.remove));

module.exports = router;
