const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 80 },
  url: String,
  poster: String,
  publicId: String
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
