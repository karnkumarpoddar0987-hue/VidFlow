const yt = require('../services/youtube');

exports.search = async (req, res) => {
  const { q, maxResults = 20, pageToken } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
  try {
    const result = await yt.searchVideos(q, parseInt(maxResults), pageToken);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const video = await yt.getVideoById(req.params.videoId);
    res.json(video);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const videos = await yt.getTrending(req.query.region || 'US', parseInt(req.query.maxResults || 20));
    res.json({ videos });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.getRelated = async (req, res) => {
  try {
    const videos = await yt.getRelatedVideos(req.params.videoId);
    res.json({ videos });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.getSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ suggestions: [] });
  try {
    const suggestions = await yt.getSearchSuggestions(q);
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getShorts = async (req, res) => {
  try {
    const result = await yt.searchVideos('#shorts', 20);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
