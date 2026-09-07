const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { wrapDB } = require('../middleware/dbErrorHandler');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = wrapDB(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { username, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Email already registered' });
  const user = await User.create({ username, email, password });
  res.status(201).json({ user, token: generateToken(user._id) });
});

exports.login = wrapDB(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ user, token: generateToken(user._id) });
});

exports.getMe = (req, res) => res.json(req.user);
