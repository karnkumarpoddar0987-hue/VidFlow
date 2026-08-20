import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ListVideo, X, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PlaylistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get(`/playlists/${id}`).then(r => { setPlaylist(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id, user]);

  const removeVideo = async (videoId) => {
    try {
      const res = await api.delete(`/playlists/${id}/videos/${videoId}`);
      setPlaylist(res.data);
      toast.success('Video removed');
    } catch (err) { toast.error(err.message); }
  };

  if (!user) return (
    <div className="flex items-center justify-center py-20 px-4">
      <p className="text-zinc-500">Sign in to view playlists</p>
    </div>
  );

  if (loading) return <div className="text-center py-12 text-zinc-400">Loading...</div>;
  if (!playlist) return <div className="text-center py-12 text-zinc-500">Playlist not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <Link to="/playlists" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Playlists
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
          <ListVideo size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{playlist.name}</h1>
          <p className="text-sm text-zinc-500">{playlist.videos?.length || 0} videos</p>
        </div>
      </div>

      {playlist.videos?.length === 0 ? (
        <div className="text-center py-20">
          <ListVideo size={48} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
          <p className="text-zinc-500">This playlist is empty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {playlist.videos.map((video, i) => (
            <div key={video.videoId} className="flex gap-3 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 group transition-colors">
              <span className="text-sm text-zinc-400 w-6 text-center shrink-0 self-center">{i + 1}</span>
              <Link to={`/watch/${video.videoId}`} className="relative shrink-0 w-36 aspect-video rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
                {video.duration && <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{video.duration}</span>}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/watch/${video.videoId}`}>
                  <h3 className="text-sm font-semibold line-clamp-2 mb-1 hover:text-blue-500 transition-colors">{video.title}</h3>
                </Link>
                <p className="text-xs text-zinc-500">{video.channelName}</p>
              </div>
              <button onClick={() => removeVideo(video.videoId)}
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
