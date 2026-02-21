require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const errorHandler = require('./middleware/errorHandler');
const initDatabase = require('./config/initDb');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'बहुत ज़्यादा अनुरोध। कृपया कुछ देर बाद कोशिश करें।' } });
app.use('/api/', limiter);

const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/home', require('./routes/home'));
app.use('/api/health', require('./routes/health'));
app.use('/api/pension', require('./routes/pension'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/community', require('./routes/community'));
app.use('/api/gov-updates', require('./routes/govUpdates'));
app.use('/api/help', require('./routes/help'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/api/health-check', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'GuruMitra API' });
});

app.use(errorHandler);

async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`\n🎓 GuruMitra Backend running on http://localhost:${PORT}`);
    console.log(`📋 API Health: http://localhost:${PORT}/api/health-check\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
