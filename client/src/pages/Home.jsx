import React, { useState, useEffect, useCallback, useRef } from 'react';
import VideoCard from '../components/VideoCard';
import CategoryChips from '../components/CategoryChips';
import { GridSkeleton } from '../components/VideoSkeleton';
import { searchVideos, getTrending } from '../services/videoService';
import { AlertCircle, RefreshCw } from 'lucide-react';

const categoryMap = {
  All: null, Music: 'music', Gaming: 'gaming', Live: 'live streaming',
  News: 'news today', Sports: 'sports highlights', Movies: 'movies trailer',
  Education: 'education', Technology: 'technology', Coding: 'programming tutorial',
  AI: 'artificial intelligence', Fitness: 'fitness workout', Cricket: 'cricket highlights',
  Comedy: 'comedy', Science: 'science', Travel: 'travel vlog', Food: 'cooking recipe'
};

// Random search terms for variety on each load
const trendingQueries = [
  'trending 2024', 'viral videos', 'top songs 2024', 'funny moments',
  'news today', 'new movies 2024', 'gaming highlights', 'tech review',
  'motivational', 'cooking recipes', 'travel vlog', 'science explained',
  'sports highlights 2024', 'music hits', 'documentary', 'comedy skits'
];

export default function Home() {
  const [category, setCategory] = useState('All');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);

  const fetchVideos = useCallback(async (cat) => {
    setLoading(true);
    setError(null);
    setVideos([]);
    setNextPageToken(null);
    try {
      let result;
      if (cat === 'All') {
        // Mix trending + random query for variety
        const randomQ = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
        const [trendRes, searchRes] = await Promise.allSettled([
          getTrending(12),
          searchVideos(randomQ, 12)
        ]);
        const trendVideos = trendRes.status === 'fulfilled' ? (trendRes.value.videos || []) : [];
        const searchVids = searchRes.status === 'fulfilled' ? (searchRes.value.videos || []) : [];
        // Shuffle mix
        const mixed = [...trendVideos, ...searchVids].sort(() => Math.random() - 0.5);
        setVideos(mixed);
        if (searchRes.status === 'fulfilled') setNextPageToken(searchRes.value.nextPageToken);
      } else {
        result = await searchVideos(categoryMap[cat], 24);
        setVideos(result.videos || []);
        setNextPageToken(result.nextPageToken);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVideos(category); }, [category]);

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !nextPageToken) return;
    setLoadingMore(true);
    try {
      const q = category === 'All'
        ? trendingQueries[Math.floor(Math.random() * trendingQueries.length)]
        : categoryMap[category];
      const result = await searchVideos(q, 24, nextPageToken);
      setVideos(prev => {
        const existingIds = new Set(prev.map(v => v.videoId));
        const newVids = (result.videos || []).filter(v => !existingIds.has(v.videoId));
        return [...prev, ...newVids];
      });
      setNextPageToken(result.nextPageToken);
    } catch {}
    finally { setLoadingMore(false); }
  }, [loadingMore, nextPageToken, category]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="pb-20 md:pb-4">
      <CategoryChips active={category} onChange={(cat) => { setCategory(cat); }} />

      {loading ? (
        <GridSkeleton count={12} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-zinc-500 text-sm mb-4 max-w-md">{error}</p>
          <button onClick={() => fetchVideos(category)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {videos.map(v => <VideoCard key={v.videoId} video={v} />)}
          </div>

          {/* Infinite scroll loader */}
          <div ref={loaderRef} className="py-4">
            {loadingMore && <GridSkeleton count={8} />}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-20 text-zinc-400">No videos found for this category.</div>
          )}
        </>
      )}
    </div>
  );
}
