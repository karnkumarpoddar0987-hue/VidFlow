import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import { GridSkeleton } from '../components/VideoSkeleton';

export default function Subscriptions() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/subscriptions/feed').then(r => {
      setVideos(r.data.videos || []);
      setLoading(false);
    }).catch(err => { setError(err.message); setLoading(false); });
  }, [user]);

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <Users size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
      <p className="text-zinc-500 mb-4">Sign in to see videos from channels you subscribe to</p>
      <Link to="/login" className="px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">Sign In</Link>
    </div>
  );

  return (
    <div className="px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users size={22} /> Subscriptions</h1>
      {loading ? (
        <GridSkeleton count={12} />
      ) : error ? (
        <div className="text-center py-12 text-zinc-500">{error}</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <Users size={48} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
          <p className="text-zinc-500 mb-2">No subscription videos yet</p>
          <p className="text-zinc-400 text-sm">Subscribe to channels to see their latest videos here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map(v => <VideoCard key={v.videoId} video={v} />)}
        </div>
      )}
    </div>
  );
}
