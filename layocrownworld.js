const env = require('./config/env');   // loads .env first and checks it
const connectDB = require('./config/db');
const app = require('./app');

connectDB()
  .then(() => app.listen(env.port, () => console.log('Layocrowns running on ' + env.port)))
  .catch(e => { console.error(e); process.exit(1); });
