const yt = require('../services/youtube');

// ── Indian-first Shorts queries (rotated) ──────────────────────────────────
const SHORTS_QUERIES = [
  'Hindi funny shorts', 'desi comedy shorts', 'Indian funny shorts',
  'Hindi comedy shorts', 'Indian viral shorts', 'desi memes shorts',
  'Bollywood shorts', 'Hindi songs shorts', 'Indian cricket shorts',
  'India trending shorts', 'Indian gaming shorts', 'Indian tech shorts',
  'Hindi motivation shorts', 'Indian entertainment shorts',
  'BGMI shorts', 'Free Fire India shorts', 'IPL shorts',
  'Bollywood comedy shorts', 'Hindi memes shorts', 'desi funny shorts',
  'Indian music shorts', 'Hindi status shorts', 'Indian dance shorts',
  '#shorts India', '#shorts Hindi', 'viral shorts India'
];

// ── Indian-first long video queries per category ───────────────────────────
const LONG_QUERIES = {
  All: [
    'Hindi songs', 'Bollywood songs', 'Indian comedy', 'Hindi comedy',
    'Indian standup comedy', 'Cricket India', 'IPL highlights',
    'Indian gaming', 'BGMI gameplay', 'Indian tech review',
    'Hindi education', 'Indian vlog', 'Hindi podcast',
    'Bollywood interview', 'Hindi trending', 'Indian entertainment',
    'Hindi movies full', 'Indian music', 'Indian news today',
    'AI Hindi', 'coding Hindi', 'Trending India'
  ],
  Music: ['Hindi songs 2024', 'Bollywood songs', 'Indian music', 'Hindi new songs', 'Punjabi songs'],
  Gaming: ['Indian gaming', 'BGMI India', 'Free Fire India', 'gaming highlights', 'Minecraft India'],
  Cricket: ['Cricket India', 'IPL 2024', 'India cricket match', 'cricket highlights India', 'BCCI'],
  Comedy: ['Hindi comedy', 'Indian standup', 'desi comedy', 'Bollywood comedy', 'Indian funny'],
  Movies: ['Bollywood movie', 'Hindi movie', 'Indian cinema', 'new Bollywood', 'Hindi films'],
  Education: ['Hindi education', 'Indian study', 'UPSC Hindi', 'coding Hindi', 'science Hindi'],
  Technology: ['Indian tech', 'tech Hindi', 'smartphone review India', 'AI Hindi', 'tech India'],
  AI: ['AI Hindi', 'artificial intelligence India', 'ChatGPT Hindi', 'AI tutorial Hindi'],
  Coding: ['coding Hindi', 'programming Hindi', 'web development Hindi', 'Python Hindi'],
  News: ['India news today', 'Hindi news', 'Indian news', 'news India', 'Aaj tak'],
  Sports: ['sports India', 'cricket India', 'kabaddi', 'hockey India', 'Indian sports'],
  Live: ['India live', 'Hindi live', 'cricket live India', 'Indian live stream'],
  Fitness: ['fitness India', 'yoga Hindi', 'gym India', 'workout Hindi'],
  Science: ['science Hindi', 'vigyan Hindi', 'Indian science', 'science facts Hindi'],
  Travel: ['India travel', 'Indian vlog', 'travel Hindi', 'India tourism'],
  Food: ['Indian cooking', 'Hindi recipe', 'Indian food', 'desi food', 'Indian chef']
};

// ── Helper: is this a Shorts-length video? ───────────────────────────────
const isShortsLength = (rawDuration) => {
  if (!rawDuration) return true;
  const m = rawDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return true;
  const h = parseInt(m[1] || 0);
  const mins = parseInt(m[2] || 0);
  return h === 0 && mins <= 3;
};

const isLongVideo = (rawDuration) => {
  if (!rawDuration) return false;
  const m = rawDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return false;
  const h = parseInt(m[1] || 0);
  const mins = parseInt(m[2] || 0);
  return h > 0 || mins >= 4;
};

exports.search = async (req, res) => {
  const { q, maxResults = 20, pageToken } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
  try {
    const result = await yt.searchVideos(q, parseInt(maxResults), pageToken, 'IN');
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
  const { pageToken, category } = req.query;
  const cat = category || 'All';
  const queries = LONG_QUERIES[cat] || LONG_QUERIES.All;

  // Rotate query based on time slot so results vary on refresh
  const slot = Math.floor(Date.now() / 180000) % queries.length; // rotates every 3 min
  const query = queries[slot];

  try {
    // Mix IN trending + query search for Indian-first feel
    const [trendIN, searchIN] = await Promise.allSettled([
      yt.getTrending('IN', 12),
      yt.searchVideos(query, 12, pageToken || '', 'IN')
    ]);

    const trendVids = trendIN.status === 'fulfilled' ? trendIN.value : [];
    const searchVids = searchIN.status === 'fulfilled' ? (searchIN.value.videos || []) : [];

    // Deduplicate
    const seen = new Set();
    const all = [];
    for (const v of [...trendVids, ...searchVids]) {
      if (v.videoId && !seen.has(v.videoId)) {
        seen.add(v.videoId);
        all.push(v);
      }
    }

    // Shuffle for variety
    all.sort(() => Math.random() - 0.5);

    res.json({
      videos: all,
      nextPageToken: searchIN.status === 'fulfilled' ? (searchIN.value.nextPageToken || null) : null
    });
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
  const { pageToken, queryIndex } = req.query;

  // Pick query — use queryIndex from client so each load gets a different category
  const idx = queryIndex !== undefined
    ? parseInt(queryIndex) % SHORTS_QUERIES.length
    : Math.floor(Date.now() / 300000) % SHORTS_QUERIES.length;

  const query = SHORTS_QUERIES[idx];

  try {
    const result = await yt.searchVideos(query, 15, pageToken || '', 'IN');

    // Filter to Shorts-length only
    const filtered = result.videos.filter(v => isShortsLength(v.rawDuration));

    res.json({
      videos: filtered.length >= 5 ? filtered : result.videos.slice(0, 12),
      nextPageToken: result.nextPageToken || null,
      hasMore: !!result.nextPageToken,
      queryIndex: (idx + 1) % SHORTS_QUERIES.length // tell client which query to use next
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
