import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Clock, Share2 } from 'lucide-react';
import { format } from 'timeago.js';
import api from '../services/api';
import toast from 'react-hot-toast';

function ChannelAvatar({ channelId, channelTitle, size = 9 }) {
  const initials = channelTitle?.[0]?.toUpperCase() || 'C';
  const colors = [
    'from-blue-500 to-violet-600', 'from-pink-500 to-rose-600',
    'from-green-500 to-teal-600', 'from-orange-500 to-amber-600',
    'from-purple-500 to-indigo-600', 'from-cyan-500 to-blue-600',
    'from-red-500 to-pink-600', 'from-yellow-500 to-orange-600'
  ];
  const colorIdx = channelId ? (channelId.charCodeAt(2) || 0) % colors.length : 0;
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white font-semibold text-sm shrink-0`}>
      {initials}
    </div>
  );
}

export default function VideoCard({ video, horizontal = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { videoId, title, thumbnail, channelTitle, channelId, viewCount, publishedAt, duration } = video;

  if (horizontal) {
    return (
      <div className="flex gap-3 group rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
        <Link to={`/watch/${videoId}`} className="relative shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          {duration && <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">{duration}</span>}
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${videoId}`}>
            <h3 className="text-sm font-semibold line-clamp-2 leading-snug mb-1 hover:text-blue-500 transition-colors">{title}</h3>
          </Link>
          <Link to={`/channel/${channelId}`} className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 block mb-0.5">
            {channelTitle}
          </Link>
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            {viewCount && <span>{viewCount} views</span>}
            {viewCount && publishedAt && <span>•</span>}
            {publishedAt && <span>{format(publishedAt)}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col">
      <Link to={`/watch/${videoId}`} className="relative block rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 aspect-video mb-3">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {duration && <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">{duration}</span>}
      </Link>
      <div className="flex gap-3">
        <Link to={`/channel/${channelId}`} className="shrink-0 mt-0.5">
          <ChannelAvatar channelId={channelId} channelTitle={channelTitle} />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${videoId}`}>
            <h3 className="text-sm font-semibold line-clamp-2 leading-snug mb-1 hover:text-blue-500 transition-colors">{title}</h3>
          </Link>
          <Link to={`/channel/${channelId}`} className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 block">
            {channelTitle}
          </Link>
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {viewCount && <span>{viewCount} views</span>}
            {viewCount && publishedAt && <span>•</span>}
            {publishedAt && <span>{format(publishedAt)}</span>}
          </div>
        </div>
        <div className="relative shrink-0">
          <button onClick={(e) => { e.preventDefault(); setMenuOpen(p => !p); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all mt-1">
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-10 overflow-hidden">
              <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/watch/${videoId}`); toast.success('Link copied!'); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left">
                <Share2 size={14} /> Copy Link
              </button>
              <button onClick={() => { api.post('/watch-later', { videoId, metadata: { title, thumbnail, channelName: channelTitle, channelId, duration } }).then(() => toast.success('Saved to Watch Later')).catch(e => toast.error(e.message)); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left">
                <Clock size={14} /> Watch Later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
