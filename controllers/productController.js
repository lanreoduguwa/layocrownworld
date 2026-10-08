const mongoose = require('mongoose');
const Product = require('../models/Product');
const { CATS } = require('../config/constants');
const { uploadBuffer, destroy, optimizedImage } = require('../config/cloudinary');

exports.list = async (req, res) =>
  res.json(await Product.find().sort('-createdAt').select('-__v -imageId'));

exports.create = async (req, res) => {
  const { name, category, price, description } = req.body;
  if (!name?.trim() || !CATS.includes(category) || price === '' || !(+price >= 0))
    return res.status(400).json({ error: 'Name, category and price are required' });

  let image, imageId;
  if (req.file) {
    const r = await uploadBuffer(req.file.buffer, 'layocrowns/products', 'image');
    image = optimizedImage(r.secure_url); imageId = r.public_id;
  }
  res.status(201).json(await Product.create({ name, category, price: +price, description, image, imageId }));
};

exports.toggleStock = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.sendStatus(404);
  const p = await Product.findById(req.params.id);
  if (!p) return res.sendStatus(404);
  p.inStock = !p.inStock;
  await p.save();
  res.json(p);
};

exports.remove = async (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (p) destroy(p.imageId);
  }
  res.json({ ok: true });
};
