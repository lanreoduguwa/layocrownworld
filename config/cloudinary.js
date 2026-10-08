const cloudinary = require('cloudinary').v2;
const env = require('./env');

cloudinary.config(env.cloudinary);

// Upload a file held in memory. type is 'image' or 'video'.
const uploadBuffer = (buffer, folder, type = 'image') => new Promise((ok, no) =>
  cloudinary.uploader.upload_stream({ folder, resource_type: type }, (e, r) => (e ? no(e) : ok(r))).end(buffer));

// Remove a file. Failures are ignored on purpose: a leftover file must never break a request.
const destroy = (publicId, type = 'image') =>
  publicId ? cloudinary.uploader.destroy(publicId, { resource_type: type }).catch(() => {}) : Promise.resolve();

// Smaller, compressed copy of a photo.
const optimizedImage = url => url.replace('/upload/', '/upload/w_900,q_auto,f_auto/');

module.exports = { uploadBuffer, destroy, optimizedImage };
