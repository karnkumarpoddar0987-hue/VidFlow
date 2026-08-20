const axios = require('axios');

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const API_KEY = process.env.YOUTUBE_API_KEY;

const checkApiKey = () => {
  if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_DATA_API_V3_KEY') {
    throw { status: 503, message: 'YouTube API key not configured. Please set YOUTUBE_API_KEY in your .env file.' };
  }
};

const formatDuration = (iso) => {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatCount = (num) => {
  if (!num) return '0';
  const n = parseInt(num);
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
};

const formatVideo = (item, details = {}) => ({
  videoId: item.id?.videoId || item.id || '',
  title: item.snippet?.title || '',
  description: item.snippet?.description || '',
  thumbnail:
    item.snippet?.thumbnails?.maxres?.url ||
    item.snippet?.thumbnails?.high?.url ||
    item.snippet?.thumbnails?.medium?.url ||
    item.snippet?.thumbnails?.default?.url || '',
  channelId: item.snippet?.channelId || '',
  channelTitle: item.snippet?.channelTitle || '',
  publishedAt: item.snippet?.publishedAt || '',
  duration: formatDuration(details.contentDetails?.duration),
  rawDuration: details.contentDetails?.duration || '',
  viewCount: formatCount(details.statistics?.viewCount),
  likeCount: formatCount(details.statistics?.likeCount),
  commentCount: formatCount(details.statistics?.commentCount),
  tags: item.snippet?.tags || []
});

const searchVideos = async (query, maxResults = 20, pageToken = '') => {
  checkApiKey();
  const params = {
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults,
    key: API_KEY,
    ...(pageToken && { pageToken })
  };
  const { data } = await axios.get(`${YOUTUBE_API_BASE}/search`, { params });
  const videoIds = data.items.map(i => i.id.videoId).join(',');

  // Fetch video details for duration and stats
  let detailsMap = {};
  if (videoIds) {
    const detailRes = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: { part: 'contentDetails,statistics', id: videoIds, key: API_KEY }
    });
    detailRes.data.items.forEach(v => { detailsMap[v.id] = v; });
  }

  return {
    videos: data.items.map(item => formatVideo(item, detailsMap[item.id.videoId] || {})),
    nextPageToken: data.nextPageToken || null,
    totalResults: data.pageInfo?.totalResults || 0
  };
};

const getVideoById = async (videoId) => {
  checkApiKey();
  const { data } = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
    params: { part: 'snippet,contentDetails,statistics', id: videoId, key: API_KEY }
  });
  if (!data.items || data.items.length === 0) throw { status: 404, message: 'Video not found' };
  const item = data.items[0];
  return formatVideo({ id: item.id, snippet: item.snippet }, item);
};

const getTrending = async (regionCode = 'US', maxResults = 20) => {
  checkApiKey();
  const { data } = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
    params: { part: 'snippet,contentDetails,statistics', chart: 'mostPopular', regionCode, maxResults, key: API_KEY }
  });
  return data.items.map(item => formatVideo({ id: item.id, snippet: item.snippet }, item));
};

const getRelatedVideos = async (videoId, maxResults = 15) => {
  checkApiKey();
  try {
    const { data } = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: { part: 'snippet', relatedToVideoId: videoId, type: 'video', maxResults, key: API_KEY }
    });
    const videoIds = data.items.map(i => i.id.videoId).join(',');
    let detailsMap = {};
    if (videoIds) {
      const detailRes = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: { part: 'contentDetails,statistics', id: videoIds, key: API_KEY }
      });
      detailRes.data.items.forEach(v => { detailsMap[v.id] = v; });
    }
    return data.items.map(item => formatVideo(item, detailsMap[item.id.videoId] || {}));
  } catch (e) {
    // relatedToVideoId may be deprecated in some quota levels — fallback to search
    const video = await getVideoById(videoId);
    const result = await searchVideos(video.title.split(' ').slice(0, 3).join(' '), maxResults);
    return result.videos.filter(v => v.videoId !== videoId);
  }
};

const getChannelInfo = async (channelId) => {
  checkApiKey();
  const { data } = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
    params: { part: 'snippet,statistics,brandingSettings', id: channelId, key: API_KEY }
  });
  if (!data.items || data.items.length === 0) throw { status: 404, message: 'Channel not found' };
  const ch = data.items[0];

  // Get best thumbnail — try all sizes
  const thumbnails = ch.snippet?.thumbnails || {};
  const thumbnail =
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url || '';

  // Banner — YouTube provides this in brandingSettings
  const bannerRaw = ch.brandingSettings?.image?.bannerExternalUrl || '';
  // Use smaller banner size that loads reliably
  const banner = bannerRaw ? `${bannerRaw}=w1280` : '';

  return {
    channelId: ch.id,
    title: ch.snippet?.title,
    description: ch.snippet?.description,
    customUrl: ch.snippet?.customUrl?.replace('@', '') || '',
    thumbnail,
    banner,
    subscriberCount: formatCount(ch.statistics?.subscriberCount),
    videoCount: formatCount(ch.statistics?.videoCount),
    viewCount: formatCount(ch.statistics?.viewCount),
    country: ch.snippet?.country || ''
  };
};

const getChannelVideos = async (channelId, maxResults = 20) => {
  checkApiKey();
  const { data } = await axios.get(`${YOUTUBE_API_BASE}/search`, {
    params: { part: 'snippet', channelId, type: 'video', order: 'date', maxResults, key: API_KEY }
  });
  const videoIds = data.items.map(i => i.id.videoId).join(',');
  let detailsMap = {};
  if (videoIds) {
    const detailRes = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: { part: 'contentDetails,statistics', id: videoIds, key: API_KEY }
    });
    detailRes.data.items.forEach(v => { detailsMap[v.id] = v; });
  }
  return data.items.map(item => formatVideo(item, detailsMap[item.id.videoId] || {}));
};

const getSearchSuggestions = async (query) => {
  // YouTube doesn't offer a public suggestions API via Data API v3
  // Return prefix-based static suggestions as fallback
  const base = query.toLowerCase().trim();
  return [
    base,
    `${base} tutorial`,
    `${base} for beginners`,
    `${base} full course`,
    `${base} projects`,
    `${base} 2024`,
    `${base} advanced`,
    `${base} tips`
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);
};

module.exports = {
  searchVideos,
  getVideoById,
  getTrending,
  getRelatedVideos,
  getChannelInfo,
  getChannelVideos,
  getSearchSuggestions
};
