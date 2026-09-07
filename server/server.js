const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { requireDB } = require('./middleware/dbCheck');

const app = express();

// Trust Render's proxy (fixes ERR_ERL_UNEXPECTED_X_FORWARDED_FOR)
app.set('trust proxy', 1);

// Connect DB — graceful failure, server starts regardless
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.ip ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    '0.0.0.0'
});
app.use('/api/', limiter);

// ── VIDEO ROUTES — no MongoDB required ──────────────────────────────────────
// These only call YouTube Data API v3. They work even if MongoDB is down.
app.use('/api/videos', require('./routes/videos'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/proxy', require('./routes/proxy'));

// ── DB-DEPENDENT ROUTES — requires MongoDB connection ───────────────────────
// requireDB returns 503 gracefully instead of crashing when DB is offline.
app.use('/api/auth',          requireDB, require('./routes/auth'));
app.use('/api/users',         requireDB, require('./routes/users'));
app.use('/api/history',       requireDB, require('./routes/history'));
app.use('/api/watch-later',   requireDB, require('./routes/watchLater'));
app.use('/api/playlists',     requireDB, require('./routes/playlists'));
app.use('/api/comments',      requireDB, require('./routes/comments'));
app.use('/api/subscriptions', requireDB, require('./routes/subscriptions'));
app.use('/api/notifications', requireDB, require('./routes/notifications'));
app.use('/api/likes',         requireDB, require('./routes/likes'));

// ── Health check ─────────────────────────────────────────────────────────────
const mongoose = require('mongoose');
app.get('/api/health', (req, res) => {
  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    db: dbStates[mongoose.connection.readyState] || 'unknown',
    youtube: !!process.env.YOUTUBE_API_KEY
  });
});

// ── Serve built React frontend ───────────────────────────────────────────────
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`VidFlow running on port ${PORT}`));
