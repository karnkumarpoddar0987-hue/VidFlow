const History = require('../models/History');
const { wrapDB } = require('../middleware/dbErrorHandler');

exports.addHistory = wrapDB(async (req, res) => {
  const { videoId, title, thumbnail, channelName, channelId, duration, viewCount } = req.body;
  const entry = await History.findOneAndUpdate(
    { userId: req.user._id, videoId },
    { userId: req.user._id, videoId, title, thumbnail, channelName, channelId, duration, viewCount, watchedAt: new Date() },
    { upsert: true, new: true }
  );
  res.json(entry);
});

exports.getHistory = wrapDB(async (req, res) => {
  const history = await History.find({ userId: req.user._id }).sort({ watchedAt: -1 }).limit(100);
  res.json({ history });
});

exports.deleteHistory = wrapDB(async (req, res) => {
  await History.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ message: 'Removed from history' });
});

exports.clearHistory = wrapDB(async (req, res) => {
  await History.deleteMany({ userId: req.user._id });
  res.json({ message: 'History cleared' });
});
