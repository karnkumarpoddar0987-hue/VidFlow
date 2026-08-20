import React, { useState, useEffect, useCallback, useRef } from 'react';
import VideoCard from '../components/VideoCard';
import CategoryChips from '../components/CategoryChips';
import { GridSkeleton } from '../components/VideoSkeleton';
import { searchVideos, getTrending } from '../services/videoService';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Indian-first category queries
const categoryMap = {
  All:        null,
  Music:      'Hindi songs Bollywood music Indian',
  Gaming:     'Indian gaming BGMI Free Fire India',
  Live:       'India live Hindi live stream',
  News:       'India news today Hindi news',
  Sports:     'cricket India sports India IPL',
  Movies:     'Bollywood movie Hindi film Indian cinema',
  Education:  'Hindi education Indian learning UPSC',
  Technology: 'Indian tech review Hindi technology',
  Coding:     'coding Hindi programming India',
  AI:         'AI Hindi artificial intelligence India',
  Fitness:    'fitness India yoga Hindi workout',
  Cricket:    'cricket India IPL Indian team',
  Comedy:     'Hindi comedy Indian standup desi funny',
  Science:    'science Hindi Indian science',
  Travel:     'India travel Hindi vlog Indian tourism',
  Food:       'Indian cooking Hindi recipe desi food'
};

// Indian-first trending queries — rotated for variety
const indianTrendingQueries = [
  'Hindi songs 2024', 'Bollywood songs', 'Indian comedy',
  'Hindi comedy', 'Cricket India', 'IPL highlights',
  'Indian gaming BGMI', 'Indian tech review', 'Hindi education',
  'Indian vlog', 'Bollywood entertainment', 'Hindi trending',
  'Indian music', 'India news today', 'desi comedy',
  'Indian standup comedy', 'Hindi movies', 'Free Fire India'
];

// 20-30% international mix
const globalQueries = [
  'trending technology', 'gaming highlights', 'music global',
  'world news today', 'AI technology 2024', 'sports highlights'
];

export default function Home() {
  const [category, setCategory] = useState('All');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [seenIds, setSeenIds] = useState(new Set());
  const loaderRef = useRef(null);

  const dedupe = (newVids, existingIds) => {
    const added = [];
    const updated = new Set(existingIds);
    for (const v of newVids) {
      if (!v.videoId || updated.has(v.videoId)) continue;
      updated.add(v.videoId);
      added.push(v);
    }
    return { added, updated };
  };

  const fetchVideos = useCallback(async (cat) => {
    setLoading(true);
    setError(null);
    setVideos([]);
    setNextPageToken(null);
    setSeenIds(new Set());

    try {
      if (cat === 'All') {
        // Rotate Indian query based on time (changes every 3 min)
        const slot = Math.floor(Date.now() / 180000) % indianTrendingQueries.length;
        const indianQ = indianTrendingQueries[slot];
        const globalQ = globalQueries[Math.floor(Math.random() * globalQueries.length)];

        const [trendIN, indRes, globRes] = await Promise.allSettled([
          getTrending(10),            // Trending IN from server
          searchVideos(indianQ, 10),  // Indian search
          searchVideos(globalQ, 5)    // Small global mix
        ]);

        const t = trendIN.status === 'fulfilled' ? (trendIN.value.videos || []) : [];
        const ind = indRes.status === 'fulfilled' ? (indRes.value.videos || []) : [];
        const glob = globRes.status === 'fulfilled' ? (globRes.value.videos || []) : [];

        // 70-80% Indian, 20-30% global — interleave
        const indianPool = [...t, ...ind];
        const mixed = [];
        let gi = 0;
        indianPool.forEach((v, i) => {
          mixed.push(v);
          // Insert 1 global every 4 Indian
          if ((i + 1) % 4 === 0 && gi < glob.length) mixed.push(glob[gi++]);
        });
        while (gi < glob.length) mixed.push(glob[gi++]);

        const { added, updated } = dedupe(mixed, new Set());
        setVideos(added);
        setSeenIds(updated);
        if (indRes.status === 'fulfilled') setNextPageToken(indRes.value.nextPageToken || null);

      } else {
        const result = await searchVideos(categoryMap[cat] || cat, 24);
        const { added, updated } = dedupe(result.videos || [], new Set());
        setVideos(added);
        setSeenIds(updated);
        setNextPageToken(result.nextPageToken || null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVideos(category); }, [category]);

  // Infinite scroll — load more
  const loadMore = useCallback(async () => {
    if (loadingMore || !nextPageToken) return;
    setLoadingMore(true);
    try {
      const slot = Math.floor(Date.now() / 180000) % indianTrendingQueries.length;
      const q = category === 'All'
        ? indianTrendingQueries[(slot + 1) % indianTrendingQueries.length]
        : categoryMap[category] || category;

      const result = await searchVideos(q, 20, nextPageToken);
      const { added, updated } = dedupe(result.videos || [], seenIds);
      setVideos(prev => [...prev, ...added]);
      setSeenIds(updated);
      setNextPageToken(result.nextPageToken || null);
    } catch {}
    finally { setLoadingMore(false); }
  }, [loadingMore, nextPageToken, category, seenIds]);

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
      <CategoryChips active={category} onChange={setCategory} />

      {loading ? (
        <GridSkeleton count={12} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-zinc-500 text-sm mb-4 max-w-md">{error}</p>
          <button
            onClick={() => fetchVideos(category)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {videos.map(v => <VideoCard key={v.videoId} video={v} />)}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loaderRef} className="py-2">
            {loadingMore && <GridSkeleton count={8} />}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-20 text-zinc-400">
              No videos found. Try a different category.
            </div>
          )}
        </>
      )}
    </div>
  );
}
