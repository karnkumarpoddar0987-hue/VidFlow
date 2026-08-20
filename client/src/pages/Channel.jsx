import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bell, AlertCircle, Users, Video, Play } from 'lucide-react';
import { getChannelInfo, getChannelVideos } from '../services/videoService';
import VideoCard from '../components/VideoCard';
import { GridSkeleton } from '../components/VideoSkeleton';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { proxyImage } from '../utils/imageProxy';

function ChannelLogo({ channel }) {
  const [imgError, setImgError] = useState(false);
  const colors = [
    'from-blue-500 to-violet-600', 'from-pink-500 to-rose-600',
    'from-green-500 to-teal-600', 'from-orange-500 to-amber-600',
    'from-purple-500 to-indigo-600', 'from-red-500 to-pink-600',
    'from-cyan-500 to-blue-600', 'from-yellow-500 to-orange-500'
  ];
  const colorIdx = channel?.channelId ? (channel.channelId.charCodeAt(2) || 0) % colors.length : 0;

  if (channel?.thumbnail && !imgError) {
    return (
      <img
        src={proxyImage(channel.thumbnail)}
        alt={channel.title}
        onError={() => setImgError(true)}
        className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white dark:border-zinc-950 object-cover shrink-0 shadow-lg"
      />
    );
  }

  return (
    <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br ${colors[colorIdx]} border-4 border-white dark:border-zinc-950 flex items-center justify-center text-white text-4xl font-bold shrink-0 shadow-lg`}>
      {channel?.title?.[0]?.toUpperCase() || 'C'}
    </div>
  );
}

function ChannelBanner({ channel }) {
  const [bannerError, setBannerError] = useState(false);
  const colors = [
    'from-blue-600 via-violet-600 to-purple-700',
    'from-pink-600 via-rose-500 to-orange-500',
    'from-green-600 via-teal-500 to-cyan-600',
    'from-orange-500 via-amber-500 to-yellow-500',
    'from-indigo-600 via-purple-600 to-pink-600',
    'from-red-600 via-pink-500 to-rose-600'
  ];
  const colorIdx = channel?.channelId ? (channel.channelId.charCodeAt(1) || 0) % colors.length : 0;

  return (
    <div className={`w-full h-36 md:h-52 bg-gradient-to-r ${colors[colorIdx]} overflow-hidden`}>
      {channel?.banner && !bannerError && (
        <img
          src={proxyImage(channel.banner)}
          alt="Channel banner"
          onError={() => setBannerError(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

export default function Channel() {
  const { channelId } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subCount, setSubCount] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getChannelInfo(channelId), getChannelVideos(channelId, 24)])
      .then(([ch, vids]) => {
        setChannel(ch);
        setSubCount(ch.subscriberCount);
        setVideos(vids.videos || []);
        if (user) {
          api.get('/subscriptions').then(r => {
            setSubscribed(r.data.channels?.includes(channelId));
          }).catch(() => {});
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [channelId, user]);

  const toggleSubscribe = async () => {
    if (!user) { toast.error('Sign in to subscribe'); return; }
    try {
      if (subscribed) {
        await api.delete(`/subscriptions/${channelId}`);
        setSubscribed(false);
        toast.success('Unsubscribed');
      } else {
        await api.post('/subscriptions', { channelId });
        setSubscribed(true);
        toast.success(`Subscribed to ${channel?.title}`);
      }
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return (
    <div>
      <div className="h-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      <div className="px-6 py-4 animate-pulse flex gap-4">
        <div className="w-28 h-28 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0 -mt-10" />
        <div className="space-y-2 flex-1 pt-2">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-56" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-40" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-72" />
        </div>
      </div>
      <GridSkeleton count={8} />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <p className="text-zinc-500 mb-2">{error}</p>
      <Link to="/" className="text-blue-500 text-sm hover:underline">Go Home</Link>
    </div>
  );

  return (
    <div className="pb-20 md:pb-4">
      {/* Banner */}
      <ChannelBanner channel={channel} />

      {/* Channel info */}
      <div className="px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-4">
          <ChannelLogo channel={channel} />
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-2xl font-bold leading-tight">{channel?.title}</h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {channel?.customUrl && <span>@{channel.customUrl}</span>}
              {channel?.subscriberCount && (
                <><span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1"><Users size={13} />{channel.subscriberCount} subscribers</span></>
              )}
              {channel?.videoCount && (
                <><span>•</span><span className="flex items-center gap-1"><Video size={13} />{channel.videoCount} videos</span></>
              )}
            </div>
            {channel?.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 max-w-2xl">{channel.description}</p>
            )}
          </div>
          <button onClick={toggleSubscribe}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 mb-1
              ${subscribed
                ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 shadow-md'}`}>
            {subscribed ? <><Bell size={15} /> Subscribed</> : 'Subscribe'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 mb-6">
          {['videos', 'about'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
                ${activeTab === tab
                  ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Videos tab */}
        {activeTab === 'videos' && (
          videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map(v => <VideoCard key={v.videoId} video={v} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-400">
              <Play size={48} className="mx-auto mb-3 opacity-30" />
              <p>No videos found for this channel</p>
            </div>
          )
        )}

        {/* About tab */}
        {activeTab === 'about' && (
          <div className="max-w-2xl space-y-4">
            {channel?.description && (
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <h3 className="font-semibold mb-2 text-sm text-zinc-500 uppercase tracking-wide">Description</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{channel.description}</p>
              </div>
            )}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wide">Stats</h3>
              {[
                { label: 'Subscribers', value: channel?.subscriberCount },
                { label: 'Videos', value: channel?.videoCount },
                { label: 'Total Views', value: channel?.viewCount },
                { label: 'Country', value: channel?.country },
              ].filter(s => s.value).map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{s.label}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
