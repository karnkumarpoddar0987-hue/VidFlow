import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { GridSkeleton } from '../components/VideoSkeleton';
import { getTrending } from '../services/videoService';

export default function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTrending(24).then(r => { setVideos(r.videos || []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  return (
    <div className="px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><TrendingUp size={22} /> Trending</h1>
      {loading ? <GridSkeleton count={12} /> : error ? (
        <div className="flex flex-col items-center py-12 text-center">
          <AlertCircle size={40} className="text-red-400 mb-3" />
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map(v => <VideoCard key={v.videoId} video={v} />)}
        </div>
      )}
    </div>
  );
}
