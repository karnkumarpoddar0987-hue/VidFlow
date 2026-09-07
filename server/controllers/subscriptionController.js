const User = require('../models/User');
const yt = require('../services/youtube');
const { wrapDB } = require('../middleware/dbErrorHandler');

exports.subscribe = wrapDB(async (req, res) => {
  const { channelId } = req.body;
  const user = await User.findById(req.user._id);
  if (user.subscribedChannels.includes(channelId)) {
    return res.status(400).json({ error: 'Already subscribed' });
  }
  user.subscribedChannels.push(channelId);
  await user.save();
  res.json({ message: 'Subscribed', subscribedChannels: user.subscribedChannels });
});

exports.unsubscribe = wrapDB(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.subscribedChannels = user.subscribedChannels.filter(id => id !== req.params.channelId);
  await user.save();
  res.json({ message: 'Unsubscribed', subscribedChannels: user.subscribedChannels });
});

exports.getSubscriptions = wrapDB(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ channels: user.subscribedChannels });
});

exports.getSubscriptionFeed = wrapDB(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.subscribedChannels.length) return res.json({ videos: [] });
  const channelSample = user.subscribedChannels.slice(0, 5);
  const videoArrays = await Promise.allSettled(
    channelSample.map(cId => yt.getChannelVideos(cId, 6))
  );
  const videos = videoArrays
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  res.json({ videos });
});
