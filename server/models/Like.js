const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: String, required: true },
  metadata: {
    title: String,
    thumbnail: String,
    channelName: String,
    channelId: String,
    duration: String,
    viewCount: String
  },
  createdAt: { type: Date, default: Date.now }
});

likeSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
