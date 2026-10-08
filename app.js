const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const security = require('./middleware/security');
const routes = require('./routes/layocrown');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);   // Railway sits behind a proxy

app.use(security);
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

// API
app.use('/api', routes);

// Frontend lives in /public
const PUBLIC = path.join(__dirname, 'public');
const HOME = 'layocrown.html';

app.use(express.static(PUBLIC, { index: HOME, extensions: ['html'] }));

app.get('/', (req, res) => res.sendFile(path.join(PUBLIC, HOME)));
app.get('/admin', (req, res) => res.sendFile(path.join(PUBLIC, 'admin.html')));

// Fallback for page URLs only. Missing files (.png, .css, .js) and /api return a real 404.
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || path.extname(req.path)) return next();
  res.sendFile(path.join(PUBLIC, HOME));
});

app.use(errorHandler);   // must come last

module.exports = app;