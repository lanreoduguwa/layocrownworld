const env = require('../config/env');
const Setting = require('../models/Setting');

// Everything the customer site needs before it can draw itself.
exports.getConfig = async (req, res) => {
  const owner = await Setting.findOne({ key: 'owner' });
  res.json({
    name: 'Layocrowns',
    ownerName: owner?.ownerName || '',
    ownerPhoto: owner?.ownerPhoto || '',
    whatsapp: env.whatsapp,
    bank: env.bank
  });
};
