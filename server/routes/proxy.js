const router = require('express').Router();
const axios = require('axios');

// Proxy YouTube images to avoid CORS issues
router.get('/image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url required' });

  // Only allow YouTube/Google image domains
  const allowed = [
    'yt3.ggpht.com',
    'yt3.googleusercontent.com',
    'i.ytimg.com',
    'lh3.googleusercontent.com',
    'yt4.ggpht.com'
  ];
  let hostname;
  try { hostname = new URL(url).hostname; } catch { return res.status(400).end(); }
  if (!allowed.some(d => hostname.endsWith(d))) return res.status(403).end();

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.youtube.com/'
      },
      timeout: 8000
    });
    res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(response.data);
  } catch {
    res.status(502).end();
  }
});

module.exports = router;
