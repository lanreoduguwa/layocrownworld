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

app.use('/api', routes);

// Frontend lives in /public
const HOME = 'layocrown.html';
app.use(express.static(path.join(__dirname, 'public'), { index: HOME }));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', HOME)));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.use(errorHandler);   // must come last

module.exports = app;
