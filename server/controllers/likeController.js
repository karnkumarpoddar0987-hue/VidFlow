const Like = require('../models/Like');
const { wrapDB } = require('../middleware/dbErrorHandler');

exports.likeVideo = wrapDB(async (req, res) => {
  const { videoId, metadata } = req.body;
  const existing = await Like.findOne({ userId: req.user._id, videoId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ liked: false, message: 'Unliked' });
  }
  await Like.create({ userId: req.user._id, videoId, metadata });
  res.json({ liked: true, message: 'Liked' });
});

exports.getLiked = wrapDB(async (req, res) => {
  const likes = await Like.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ likes });
});

exports.checkLike = wrapDB(async (req, res) => {
  const like = await Like.findOne({ userId: req.user._id, videoId: req.params.videoId });
  res.json({ liked: !!like });
});
