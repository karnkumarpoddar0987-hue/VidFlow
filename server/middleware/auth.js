const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const DB_UNAVAILABLE = {
  error: 'Authentication unavailable. Database is temporarily offline.',
  code: 'DB_UNAVAILABLE'
};

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ error: 'Not authorized, no token' });

  // Check DB state before calling mongoose
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    return res.status(503).json(DB_UNAVAILABLE);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Lazy-require User to avoid loading model when DB is down at startup
    const User = require('../models/User');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch (error) {
    // Distinguish between JWT errors and DB errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
    // DB error during User.findById
    console.error('auth middleware DB error:', error.message);
    return res.status(503).json(DB_UNAVAILABLE);
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token && (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2)) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('../models/User');
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = { protect, optionalAuth };
