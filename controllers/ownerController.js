const Setting = require('../models/Setting');
const { uploadBuffer, destroy, optimizedImage } = require('../config/cloudinary');

exports.update = async (req, res) => {
  const owner = (await Setting.findOne({ key: 'owner' })) || new Setting({ key: 'owner' });

  if (typeof req.body.ownerName === 'string') owner.ownerName = req.body.ownerName.trim().slice(0, 60);
  if (req.file) {
    const r = await uploadBuffer(req.file.buffer, 'layocrowns/owner', 'image');
    destroy(owner.ownerPhotoId);   // remove the previous photo
    owner.ownerPhoto = optimizedImage(r.secure_url);
    owner.ownerPhotoId = r.public_id;
  }
  await owner.save();
  res.json({ ok: true, ownerName: owner.ownerName, ownerPhoto: owner.ownerPhoto });
};
