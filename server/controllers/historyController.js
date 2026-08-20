const History = require('../models/History');

exports.addHistory = async (req, res) => {
  const { videoId, title, thumbnail, channelName, channelId, duration, viewCount } = req.body;
  try {
    const entry = await History.findOneAndUpdate(
      { userId: req.user._id, videoId },
      { userId: req.user._id, videoId, title, thumbnail, channelName, channelId, duration, viewCount, watchedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await History.find({ userId: req.user._id }).sort({ watchedAt: -1 }).limit(100);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    await History.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Removed from history' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    await History.deleteMany({ userId: req.user._id });
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
