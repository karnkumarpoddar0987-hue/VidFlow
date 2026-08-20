import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListVideo, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Playlists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/playlists').then(r => { setPlaylists(r.data.playlists || []); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const create = async () => {
    if (!newName.trim()) return;
    try {
      const res = await api.post('/playlists', { name: newName });
      setPlaylists(prev => [res.data, ...prev]);
      setNewName('');
      setCreating(false);
      toast.success('Playlist created');
    } catch (err) { toast.error(err.message); }
  };

  const del = async (id) => {
    if (!confirm('Delete this playlist?')) return;
    try {
      await api.delete(`/playlists/${id}`);
      setPlaylists(prev => prev.filter(p => p._id !== id));
      toast.success('Playlist deleted');
    } catch (err) { toast.error(err.message); }
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <ListVideo size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
      <p className="text-zinc-500 mb-4">Sign in to manage your playlists</p>
      <Link to="/login" className="px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">Sign In</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ListVideo size={22} /> Playlists</h1>
        <button onClick={() => setCreating(p => !p)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
          <Plus size={16} /> New Playlist
        </button>
      </div>

      {creating && (
        <div className="flex gap-2 mb-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="Playlist name..."
            className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-blue-500"
          />
          <button onClick={create} className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"><Check size={16} /></button>
          <button onClick={() => { setCreating(false); setNewName(''); }} className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><X size={16} /></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-zinc-400">Loading...</div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20">
          <ListVideo size={48} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
          <p className="text-zinc-500">No playlists yet. Create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {playlists.map(pl => (
            <div key={pl._id} className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-blue-500/50 transition-colors overflow-hidden">
              <Link to={`/playlist/${pl._id}`} className="block p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                    <ListVideo size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{pl.name}</h3>
                    <p className="text-xs text-zinc-400">{pl.videos?.length || 0} videos</p>
                  </div>
                </div>
                {pl.description && <p className="text-xs text-zinc-500 line-clamp-2">{pl.description}</p>}
              </Link>
              <button onClick={() => del(pl._id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-950 text-red-500 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
