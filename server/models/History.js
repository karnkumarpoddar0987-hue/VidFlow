const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  thumbnail: { type: String },
  channelName: { type: String },
  channelId: { type: String },
  duration: { type: String },
  viewCount: { type: String },
  watchedAt: { type: Date, default: Date.now }
});

historySchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('History', historySchema);
