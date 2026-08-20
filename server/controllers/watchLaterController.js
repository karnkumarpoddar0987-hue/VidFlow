const WatchLater = require('../models/WatchLater');

exports.add = async (req, res) => {
  const { videoId, metadata } = req.body;
  try {
    const item = await WatchLater.findOneAndUpdate(
      { userId: req.user._id, videoId },
      { userId: req.user._id, videoId, metadata },
      { upsert: true, new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const items = await WatchLater.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ watchLater: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await WatchLater.findOneAndDelete({ videoId: req.params.videoId, userId: req.user._id });
    res.json({ message: 'Removed from Watch Later' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.check = async (req, res) => {
  try {
    const item = await WatchLater.findOne({ userId: req.user._id, videoId: req.params.videoId });
    res.json({ saved: !!item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
