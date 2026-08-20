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
  const { pageToken, category } = req.query;

  // Diverse Indian + Global shorts queries — rotated per request
  const shortsQueries = [
    '#shorts India', '#shorts Hindi', 'India shorts viral',
    'Bollywood shorts', 'Cricket shorts', 'Indian comedy shorts',
    'Indian gaming shorts', 'Indian tech shorts', '#shorts trending India',
    'Hindi shorts video', 'Indian music shorts', 'Indian education shorts',
    '#shorts viral', '#shorts funny', '#shorts gaming',
    '#shorts music', '#shorts dance', '#shorts cooking',
    'shorts AI technology', 'shorts coding tutorial',
    'shorts cricket highlights', 'shorts football',
    'shorts motivation', 'shorts facts', 'shorts science',
    'YouTube shorts trending', 'shorts entertainment'
  ];

  // Pick a query — rotate based on pageToken presence or random
  const queryIndex = pageToken
    ? Math.floor(Math.random() * shortsQueries.length)
    : Math.floor(Date.now() / 300000) % shortsQueries.length; // changes every 5 min

  const query = category || shortsQueries[queryIndex];

  try {
    const result = await yt.searchVideos(query, 15, pageToken || '');
    // Filter: prefer shorter videos (likely actual Shorts <= 60s)
    const filtered = result.videos.filter(v => {
      if (!v.rawDuration) return true;
      const m = v.rawDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!m) return true;
      const h = parseInt(m[1] || 0);
      const mins = parseInt(m[2] || 0);
      if (h > 0) return false; // skip hour-long videos
      if (mins > 3) return false; // skip videos > 3 min
      return true;
    });

    res.json({
      videos: filtered.length > 0 ? filtered : result.videos.slice(0, 10),
      nextPageToken: result.nextPageToken || null,
      hasMore: !!result.nextPageToken
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
