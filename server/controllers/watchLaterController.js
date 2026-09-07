const WatchLater = require('../models/WatchLater');
const { wrapDB } = require('../middleware/dbErrorHandler');

exports.add = wrapDB(async (req, res) => {
  const { videoId, metadata } = req.body;
  const item = await WatchLater.findOneAndUpdate(
    { userId: req.user._id, videoId },
    { userId: req.user._id, videoId, metadata },
    { upsert: true, new: true }
  );
  res.json(item);
});

exports.getAll = wrapDB(async (req, res) => {
  const items = await WatchLater.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ watchLater: items });
});

exports.remove = wrapDB(async (req, res) => {
  await WatchLater.findOneAndDelete({ videoId: req.params.videoId, userId: req.user._id });
  res.json({ message: 'Removed from Watch Later' });
});

exports.check = wrapDB(async (req, res) => {
  const item = await WatchLater.findOne({ userId: req.user._id, videoId: req.params.videoId });
  res.json({ saved: !!item });
});
