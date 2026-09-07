/**
 * dbCheck middleware — returns 503 for DB-dependent routes when MongoDB is down.
 * Video browsing routes (YouTube API) are NOT behind this middleware.
 */
const mongoose = require('mongoose');

const DB_UNAVAILABLE = {
  error: 'This feature is temporarily unavailable. Database is offline.',
  code: 'DB_UNAVAILABLE'
};

// Use on routes that REQUIRE MongoDB (auth, history, likes, comments, etc.)
const requireDB = (req, res, next) => {
  const state = mongoose.connection.readyState;
  // 1 = connected, 2 = connecting (allow through — mongoose queues ops)
  if (state === 1 || state === 2) return next();
  return res.status(503).json(DB_UNAVAILABLE);
};

module.exports = { requireDB };
