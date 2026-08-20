const yt = require('../services/youtube');

exports.getChannel = async (req, res) => {
  try {
    const channel = await yt.getChannelInfo(req.params.channelId);
    res.json(channel);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.getChannelVideos = async (req, res) => {
  try {
    const videos = await yt.getChannelVideos(req.params.channelId, parseInt(req.query.maxResults || 20));
    res.json({ videos });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
