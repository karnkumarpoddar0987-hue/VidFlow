const Like = require('../models/Like');

exports.likeVideo = async (req, res) => {
  const { videoId, metadata } = req.body;
  try {
    const existing = await Like.findOne({ userId: req.user._id, videoId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ liked: false, message: 'Unliked' });
    }
    await Like.create({ userId: req.user._id, videoId, metadata });
    res.json({ liked: true, message: 'Liked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLiked = async (req, res) => {
  try {
    const likes = await Like.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkLike = async (req, res) => {
  try {
    const like = await Like.findOne({ userId: req.user._id, videoId: req.params.videoId });
    res.json({ liked: !!like });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
