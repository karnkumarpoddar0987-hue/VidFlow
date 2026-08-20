import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LikedVideos() {
  const { user } = useAuth();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/likes').then(r => { setLikes(r.data.likes || []); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <ThumbsUp size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
      <p className="text-zinc-500 mb-4">Sign in to see your liked videos</p>
      <Link to="/login" className="px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">Sign In</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><ThumbsUp size={22} /> Liked Videos</h1>
      {loading ? (
        <div className="text-center py-12 text-zinc-400">Loading...</div>
      ) : likes.length === 0 ? (
        <div className="text-center py-20">
          <ThumbsUp size={48} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
          <p className="text-zinc-500">No liked videos yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {likes.map(item => (
            <div key={item._id} className="flex gap-3 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
              <Link to={`/watch/${item.videoId}`} className="relative shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <img src={item.metadata?.thumbnail} alt={item.metadata?.title} className="w-full h-full object-cover" loading="lazy" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/watch/${item.videoId}`}>
                  <h3 className="text-sm font-semibold line-clamp-2 mb-1 hover:text-blue-500 transition-colors">{item.metadata?.title}</h3>
                </Link>
                <p className="text-xs text-zinc-500">{item.metadata?.channelName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
