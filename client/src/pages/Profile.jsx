import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Edit2, Check, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'timeago.js';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-zinc-500 mb-4">Please sign in to view your profile</p>
        <Link to="/login" className="px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">Sign In</Link>
      </div>
    );
  }

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/me', form);
      updateUser(res.data);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Banner */}
      <div className="h-32 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 mb-0" />

      {/* Avatar & name */}
      <div className="flex items-end gap-4 -mt-12 px-4 mb-6">
        <div className="relative">
          {form.avatar
            ? <img src={form.avatar} alt={user.username} className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-950 object-cover" />
            : <div className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-950 bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold">
                {user.username?.[0]?.toUpperCase()}
              </div>
          }
        </div>
        <div className="flex-1 pb-2">
          <h1 className="text-xl font-bold">{user.username}</h1>
          <p className="text-sm text-zinc-500">{user.email}</p>
        </div>
        <button onClick={() => setEditing(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <Edit2 size={14} /> Edit
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 mb-6 space-y-4">
          <h2 className="font-semibold">Edit Profile</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Avatar URL</label>
            <input value={form.avatar} onChange={e => setForm(p => ({ ...p, avatar: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              rows={3} maxLength={500} placeholder="Tell us about yourself..."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600 transition-colors disabled:opacity-50">
              <Check size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditing(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bio */}
      {user.bio && <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">{user.bio}</p>}

      {/* Info */}
      <div className="text-xs text-zinc-400 mb-6">
        Joined {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
        {' • '}{user.subscribedChannels?.length || 0} subscriptions
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { to: '/history', label: 'Watch History' },
          { to: '/liked', label: 'Liked Videos' },
          { to: '/playlists', label: 'Playlists' },
          { to: '/watch-later', label: 'Watch Later' },
        ].map(l => (
          <Link key={l.to} to={l.to}
            className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-center">
            {l.label}
          </Link>
        ))}
      </div>

      <button onClick={() => { logout(); navigate('/'); }}
        className="flex items-center gap-2 text-red-500 text-sm font-medium hover:text-red-600 transition-colors">
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
