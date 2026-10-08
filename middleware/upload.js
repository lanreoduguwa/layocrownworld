const multer = require('multer');
const { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } = require('../config/constants');

// Files are kept in memory, then sent straight to Cloudinary.
const make = (limit, mime) => multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: limit },
  fileFilter: (req, file, cb) => cb(null, mime.test(file.mimetype))
});

module.exports = {
  imageUpload: make(MAX_IMAGE_BYTES, /^image\//),
  videoUpload: make(MAX_VIDEO_BYTES, /^video\//)
};
