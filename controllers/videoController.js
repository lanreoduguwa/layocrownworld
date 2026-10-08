const mongoose = require('mongoose');
const Video = require('../models/Video');
const { uploadBuffer, destroy } = require('../config/cloudinary');

exports.list = async (req, res) =>
  res.json(await Video.find().sort('-createdAt').select('-__v -publicId'));

exports.create = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a video file (mp4 or mov)' });
  if (!req.body.title?.trim()) return res.status(400).json({ error: 'Give the video a title' });

  const r = await uploadBuffer(req.file.buffer, 'layocrowns/videos', 'video');
  res.status(201).json(await Video.create({
    title: req.body.title,
    url: r.secure_url.replace('/upload/', '/upload/q_auto/'),
    poster: r.secure_url.replace(/\.[a-z0-9]+$/i, '.jpg'),   // Cloudinary makes a still frame from the video
    publicId: r.public_id
  }));
};

exports.remove = async (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const v = await Video.findByIdAndDelete(req.params.id);
    if (v) destroy(v.publicId, 'video');
  }
  res.json({ ok: true });
};
