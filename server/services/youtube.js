const axios = require('axios');

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Support multiple API keys — rotate when one hits 429 quota
const API_KEYS = [
  process.env.YOUTUBE_API_KEY,
  process.env.YOUTUBE_API_KEY_2,
  process.env.YOUTUBE_API_KEY_3,
  process.env.YOUTUBE_API_KEY_4,
].filter(k => k && k !== 'YOUR_YOUTUBE_DATA_API_V3_KEY');

let currentKeyIdx = 0;
const getApiKey = () => API_KEYS[currentKeyIdx % API_KEYS.length];
const rotateKey = () => {
  currentKeyIdx = (currentKeyIdx + 1) % API_KEYS.length;
  console.log(`YouTube API key rotated to index ${currentKeyIdx}`);
};

const checkApiKey = () => {
  if (!API_KEYS.length) {
    throw { status: 503, message: 'YouTube API key not configured. Please set YOUTUBE_API_KEY in your .env file.' };
  }
};

// Smart GET — auto-rotates key on 429
const ytGet = async (endpoint, params) => {
  checkApiKey();
  const maxTries = Math.max(API_KEYS.length, 1);
  for (let i = 0; i < maxTries; i++) {
    try {
      const { data } = await axios.get(`${YOUTUBE_API_BASE}/${endpoint}`, {
        params: { ...params, key: getApiKey() }
      });
      return data;
    } catch (err) {
      const status = err.response?.status;
      if (status === 429 && API_KEYS.length > 1) {
        rotateKey();
        continue;
      }
      const msg = err.response?.data?.error?.message || err.message;
      throw { status: status || 500, message: msg };
    }
  }
  throw { status: 429, message: 'All YouTube API keys exceeded daily quota. Try again tomorrow.' };
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

const searchVideos = async (query, maxResults = 20, pageToken = '', regionCode = 'IN') => {
  const data = await ytGet('search', {
    part: 'snippet', q: query, type: 'video',
    maxResults, regionCode, ...(pageToken && { pageToken })
  });
  if (!data.items?.length) return { videos: [], nextPageToken: null, totalResults: 0 };

  const videoIds = data.items.map(i => i.id.videoId).filter(Boolean).join(',');
  let detailsMap = {};
  if (videoIds) {
    const dData = await ytGet('videos', { part: 'contentDetails,statistics', id: videoIds });
    dData.items?.forEach(v => { detailsMap[v.id] = v; });
  }
  return {
    videos: data.items.map(item => formatVideo(item, detailsMap[item.id?.videoId] || {})),
    nextPageToken: data.nextPageToken || null,
    totalResults: data.pageInfo?.totalResults || 0
  };
};

const getVideoById = async (videoId) => {
  const data = await ytGet('videos', { part: 'snippet,contentDetails,statistics', id: videoId });
  if (!data.items?.length) throw { status: 404, message: 'Video not found' };
  const item = data.items[0];
  return formatVideo({ id: item.id, snippet: item.snippet }, item);
};

const getTrending = async (regionCode = 'IN', maxResults = 20) => {
  const data = await ytGet('videos', {
    part: 'snippet,contentDetails,statistics',
    chart: 'mostPopular', regionCode, maxResults
  });
  return (data.items || []).map(item => formatVideo({ id: item.id, snippet: item.snippet }, item));
};

const getRelatedVideos = async (videoId, maxResults = 15) => {
  try {
    const data = await ytGet('search', { part: 'snippet', relatedToVideoId: videoId, type: 'video', maxResults });
    const videoIds = data.items?.map(i => i.id.videoId).filter(Boolean).join(',');
    let detailsMap = {};
    if (videoIds) {
      const dData = await ytGet('videos', { part: 'contentDetails,statistics', id: videoIds });
      dData.items?.forEach(v => { detailsMap[v.id] = v; });
    }
    return (data.items || []).map(item => formatVideo(item, detailsMap[item.id?.videoId] || {}));
  } catch {
    const video = await getVideoById(videoId);
    const result = await searchVideos(video.title.split(' ').slice(0, 3).join(' '), maxResults);
    return result.videos.filter(v => v.videoId !== videoId);
  }
};

const getChannelInfo = async (channelId) => {
  const data = await ytGet('channels', { part: 'snippet,statistics,brandingSettings', id: channelId });
  if (!data.items?.length) throw { status: 404, message: 'Channel not found' };
  const ch = data.items[0];
  const thumbnails = ch.snippet?.thumbnails || {};
  const bannerRaw = ch.brandingSettings?.image?.bannerExternalUrl || '';
  return {
    channelId: ch.id,
    title: ch.snippet?.title,
    description: ch.snippet?.description,
    customUrl: ch.snippet?.customUrl?.replace('@', '') || '',
    thumbnail: thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || '',
    banner: bannerRaw ? `${bannerRaw}=w1280` : '',
    subscriberCount: formatCount(ch.statistics?.subscriberCount),
    videoCount: formatCount(ch.statistics?.videoCount),
    viewCount: formatCount(ch.statistics?.viewCount),
    country: ch.snippet?.country || ''
  };
};

const getChannelVideos = async (channelId, maxResults = 20) => {
  const data = await ytGet('search', { part: 'snippet', channelId, type: 'video', order: 'date', maxResults });
  const videoIds = data.items?.map(i => i.id.videoId).filter(Boolean).join(',');
  let detailsMap = {};
  if (videoIds) {
    const dData = await ytGet('videos', { part: 'contentDetails,statistics', id: videoIds });
    dData.items?.forEach(v => { detailsMap[v.id] = v; });
  }
  return (data.items || []).map(item => formatVideo(item, detailsMap[item.id?.videoId] || {}));
};

const getSearchSuggestions = async (query) => {
  const base = query.toLowerCase().trim();
  return [base, `${base} tutorial`, `${base} for beginners`, `${base} full course`,
    `${base} projects`, `${base} 2024`, `${base} advanced`, `${base} tips`
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);
};

module.exports = { searchVideos, getVideoById, getTrending, getRelatedVideos, getChannelInfo, getChannelVideos, getSearchSuggestions };
