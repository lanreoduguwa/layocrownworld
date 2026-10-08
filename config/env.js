// Loads .env and checks the required settings. Must be the first file the app requires.
require('dotenv').config();

const E = process.env;
const required = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_USER', 'ADMIN_PASSWORD',
  'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = required.filter(k => !E[k]);
if (missing.length) {
  console.error('Missing environment variables: ' + missing.join(', '));
  process.exit(1);
}

module.exports = {
  port: E.PORT || 5000,
  isProd: E.NODE_ENV === 'production',
  mongoUri: E.MONGO_URI,
  jwtSecret: E.JWT_SECRET,
  admin: { user: E.ADMIN_USER, password: E.ADMIN_PASSWORD },
  cloudinary: { cloud_name: E.CLOUDINARY_CLOUD_NAME, api_key: E.CLOUDINARY_API_KEY, api_secret: E.CLOUDINARY_API_SECRET },
  whatsapp: E.WHATSAPP_NUMBER || '',
  bank: { bank: E.BANK_NAME || '', accountName: E.BANK_ACCOUNT_NAME || '', accountNumber: E.BANK_ACCOUNT_NUMBER || '' }
};
