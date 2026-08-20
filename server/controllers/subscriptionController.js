const User = require('../models/User');
const Notification = require('../models/Notification');
const yt = require('../services/youtube');

exports.subscribe = async (req, res) => {
  const { channelId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user.subscribedChannels.includes(channelId)) {
      return res.status(400).json({ error: 'Already subscribed' });
    }
    user.subscribedChannels.push(channelId);
    await user.save();
    res.json({ message: 'Subscribed', subscribedChannels: user.subscribedChannels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.subscribedChannels = user.subscribedChannels.filter(id => id !== req.params.channelId);
    await user.save();
    res.json({ message: 'Unsubscribed', subscribedChannels: user.subscribedChannels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const channels = user.subscribedChannels;
    res.json({ channels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubscriptionFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.subscribedChannels.length) return res.json({ videos: [] });
    // Fetch latest videos from first 5 subscribed channels (API quota conscious)
    const channelSample = user.subscribedChannels.slice(0, 5);
    const videoArrays = await Promise.allSettled(
      channelSample.map(cId => yt.getChannelVideos(cId, 6))
    );
    const videos = videoArrays
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    res.json({ videos });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
