const mongoose = require('mongoose');

const videoItemSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  title: { type: String },
  thumbnail: { type: String },
  channelName: { type: String },
  duration: { type: String },
  addedAt: { type: Date, default: Date.now }
});

const playlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  videos: [videoItemSchema],
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Playlist', playlistSchema);
