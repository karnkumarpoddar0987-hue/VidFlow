// Proxy YouTube images through our backend to avoid CORS
export const proxyImage = (url) => {
  if (!url) return '';
  // Already a proxied or local URL
  if (url.startsWith('/') || url.startsWith('blob:')) return url;
  // YouTube image domains
  const ytDomains = ['yt3.ggpht.com', 'yt3.googleusercontent.com', 'lh3.googleusercontent.com'];
  try {
    const hostname = new URL(url).hostname;
    if (ytDomains.some(d => hostname.endsWith(d))) {
      return `/api/proxy/image?url=${encodeURIComponent(url)}`;
    }
  } catch {}
  return url;
};
