import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { VideoCardSkeleton } from '../components/VideoSkeleton';
import { searchVideos, getChannelInfo } from '../services/videoService';
import { Search as SearchIcon, AlertCircle, Bell, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// Channel card — shown at top when search matches a channel
function ChannelCard({ channel }) {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const colors = [
    'from-blue-500 to-violet-600', 'from-pink-500 to-rose-600',
    'from-green-500 to-teal-600', 'from-orange-500 to-amber-600',
    'from-purple-500 to-indigo-600', 'from-red-500 to-pink-600'
  ];
  const colorIdx = channel.channelId ? (channel.channelId.charCodeAt(2) || 0) % colors.length : 0;

  useEffect(() => {
    if (!user) return;
    api.get('/subscriptions').then(r => {
      setSubscribed(r.data.channels?.includes(channel.channelId));
    }).catch(() => {});
  }, [user, channel.channelId]);

  const toggleSubscribe = async () => {
    if (!user) { toast.error('Sign in to subscribe'); return; }
    setLoading(true);
    try {
      if (subscribed) {
        await api.delete(`/subscriptions/${channel.channelId}`);
        setSubscribed(false);
        toast.success('Unsubscribed');
      } else {
        await api.post('/subscriptions', { channelId: channel.channelId });
        setSubscribed(true);
        toast.success(`Subscribed to ${channel.title}`);
      }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-5 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 mb-4">
      {/* Avatar */}
      <Link to={`/channel/${channel.channelId}`}>
        {channel.thumbnail ? (
          <img src={channel.thumbnail} alt={channel.title}
            className="w-20 h-20 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700" />
        ) : (
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white text-3xl font-bold`}>
            {channel.title?.[0]?.toUpperCase()}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/channel/${channel.channelId}`}>
          <h2 className="font-bold text-lg hover:text-blue-500 transition-colors">{channel.title}</h2>
        </Link>
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {channel.customUrl && <span>@{channel.customUrl}</span>}
          {channel.subscriberCount && (
            <><span>•</span><span className="flex items-center gap-1"><Users size={13} />{channel.subscriberCount} subscribers</span></>
          )}
          {channel.videoCount && <><span>•</span><span>{channel.videoCount} videos</span></>}
        </div>
        {channel.description && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{channel.description}</p>
        )}
      </div>

      {/* Subscribe button */}
      <button onClick={toggleSubscribe} disabled={loading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shrink-0
          ${subscribed
            ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90'}`}>
        {subscribed ? <><Bell size={15} /> Subscribed</> : 'Subscribe'}
      </button>
    </div>
  );
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setVideos([]);
    setChannels([]);

    // Search videos + try to find matching channel
    Promise.allSettled([
      searchVideos(q, 20),
      // Search for channels via YouTube API
      api.get(`/videos/search`, { params: { q, type: 'channel', maxResults: 3 } }).catch(() => null)
    ]).then(async ([videoRes]) => {
      if (videoRes.status === 'fulfilled') {
        const vids = videoRes.value.videos || [];
        setVideos(vids);
        setNextPageToken(videoRes.value.nextPageToken);

        // Try to find channel from video results
        if (vids.length > 0) {
          // Get unique channels from results
          const seen = new Set();
          const uniqueChannels = vids.filter(v => {
            if (!seen.has(v.channelId)) { seen.add(v.channelId); return true; }
            return false;
          });

          // Check if query matches a channel name closely
          const matchingChannels = uniqueChannels.filter(v =>
            v.channelTitle?.toLowerCase().includes(q.toLowerCase()) ||
            q.toLowerCase().includes(v.channelTitle?.toLowerCase()?.split(' ')[0])
          );

          if (matchingChannels.length > 0) {
            // Fetch first matching channel info
            try {
              const chInfo = await getChannelInfo(matchingChannels[0].channelId);
              setChannels([chInfo]);
            } catch {}
          }
        }
      } else {
        setError(videoRes.reason?.message || 'Search failed');
      }
    }).finally(() => setLoading(false));
  }, [q]);

  const loadMore = async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const r = await searchVideos(q, 20, nextPageToken);
      setVideos(prev => {
        const ids = new Set(prev.map(v => v.videoId));
        return [...prev, ...(r.videos || []).filter(v => !ids.has(v.videoId))];
      });
      setNextPageToken(r.nextPageToken);
    } catch {}
    finally { setLoadingMore(false); }
  };

  if (!q) return (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
      <SearchIcon size={48} className="mb-4 opacity-40" />
      <p>Enter a search term to find videos</p>
    </div>
  );

  return (
    <div className="px-4 py-4 pb-20 md:pb-4 max-w-5xl">
      <p className="text-sm text-zinc-500 mb-4">
        {loading ? 'Searching...' : `Results for "${q}"`}
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} horizontal />)}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-12 text-center">
          <AlertCircle size={40} className="text-red-400 mb-3" />
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      ) : (
        <>
          {/* Channel cards at top */}
          {channels.map(ch => <ChannelCard key={ch.channelId} channel={ch} />)}

          {/* Video results */}
          <div className="space-y-2">
            {videos.map(v => <VideoCard key={v.videoId} video={v} horizontal />)}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-20 text-zinc-400">
              <SearchIcon size={40} className="mx-auto mb-3 opacity-30" />
              <p>No videos found for "{q}"</p>
            </div>
          )}

          {nextPageToken && (
            <div className="flex justify-center py-6">
              <button onClick={loadMore} disabled={loadingMore}
                className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50">
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
