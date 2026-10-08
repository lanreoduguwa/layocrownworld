const mongoose = require('mongoose');

// One document per setting group. Right now only { key: 'owner' } is used.
const settingSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  ownerName: String,
  ownerPhoto: String,
  ownerPhotoId: String
});

module.exports = mongoose.model('Setting', settingSchema);
