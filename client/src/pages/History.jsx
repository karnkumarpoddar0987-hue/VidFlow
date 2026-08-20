import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Trash2, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import { format } from 'timeago.js';
import toast from 'react-hot-toast';

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/history').then(r => { setHistory(r.data.history || []); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const remove = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch (err) { toast.error(err.message); }
  };

  const clearAll = async () => {
    if (!confirm('Clear all watch history?')) return;
    try {
      await api.delete('/history/clear');
      setHistory([]);
      toast.success('History cleared');
    } catch (err) { toast.error(err.message); }
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <HistoryIcon size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
      <p className="text-zinc-500 mb-4">Sign in to see your watch history</p>
      <Link to="/login" className="px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">Sign In</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><HistoryIcon size={22} /> Watch History</h1>
        {history.length > 0 && (
          <button onClick={clearAll} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors">
            <Trash2 size={16} /> Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-400">Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-20">
          <HistoryIcon size={48} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
          <p className="text-zinc-500">Your watch history is empty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map(item => (
            <div key={item._id} className="flex gap-3 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 group transition-colors">
              <Link to={`/watch/${item.videoId}`} className="relative shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                {item.duration && <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{item.duration}</span>}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/watch/${item.videoId}`}>
                  <h3 className="text-sm font-semibold line-clamp-2 leading-snug mb-1 hover:text-blue-500 transition-colors">{item.title}</h3>
                </Link>
                <p className="text-xs text-zinc-500">{item.channelName}</p>
                <p className="text-xs text-zinc-400 mt-0.5">Watched {format(item.watchedAt)}</p>
              </div>
              <button onClick={() => remove(item._id)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 shrink-0 transition-all self-start">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
