import React, {
  useState, useEffect, useRef, useCallback
} from 'react';
import {
  ThumbsUp, MessageSquare, Share2, Bell,
  ChevronUp, ChevronDown,
  Volume2, VolumeX, AlertCircle, RefreshCw, Home
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getShorts } from '../services/videoService';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const AUDIO_KEY = 'vidflow_audio_enabled';

// Read audio pref from localStorage — default true
const getAudioPref = () => {
  try { return localStorage.getItem(AUDIO_KEY) !== 'false'; }
  catch { return true; }
};

const saveAudioPref = (val) => {
  try { localStorage.setItem(AUDIO_KEY, val ? 'true' : 'false'); }
  catch {}
};

/* ─── Single Short Card ─────────────────────────────────────────────────── */
function ShortCard({ video, isActive, globalMuted, onToggleMute, onVisible }) {
  const { user } = useAuth();
  const cardRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Build iframe src — only when active, respects globalMuted
  const iframeSrc = isActive
    ? `https://www.youtube.com/embed/${video.videoId}` +
      `?autoplay=1&mute=${globalMuted ? 1 : 0}&loop=1&rel=0&modestbranding=1` +
      `&playlist=${video.videoId}&playsinline=1`
    : '';

  // IntersectionObserver — tell parent this card is visible
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisible(); },
      { threshold: 0.65 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible]);

  // Load like/subscribe state
  useEffect(() => {
    if (!user || !video.videoId) return;
    api.get(`/likes/check/${video.videoId}`).then(r => setLiked(r.data.liked)).catch(() => {});
    if (video.channelId) {
      api.get('/subscriptions').then(r => {
        setSubscribed(r.data.channels?.includes(video.channelId));
      }).catch(() => {});
    }
  }, [user, video.videoId, video.channelId]);

  const toggleLike = async () => {
    if (!user) { toast.error('Sign in to like'); return; }
    try {
      const res = await api.post('/likes', {
        videoId: video.videoId,
        metadata: {
          title: video.title, thumbnail: video.thumbnail,
          channelName: video.channelTitle, channelId: video.channelId
        }
      });
      setLiked(res.data.liked);
      toast.success(res.data.liked ? 'Liked!' : 'Unliked');
    } catch { toast.error('Failed to like'); }
  };

  const toggleSubscribe = async () => {
    if (!user) { toast.error('Sign in to subscribe'); return; }
    try {
      if (subscribed) {
        await api.delete(`/subscriptions/${video.channelId}`);
        setSubscribed(false);
        toast.success('Unsubscribed');
      } else {
        await api.post('/subscriptions', { channelId: video.channelId });
        setSubscribed(true);
        toast.success('Subscribed!');
      }
    } catch { toast.error('Failed'); }
  };

  return (
    <div
      ref={cardRef}
      className="snap-start snap-always flex-shrink-0 relative flex items-center justify-center bg-black"
      style={{ height: '100dvh', width: '100%' }}
    >
      {/* Centered player — max 420px on desktop */}
      <div
        className="relative bg-black overflow-hidden"
        style={{ height: '100dvh', width: '100%', maxWidth: '420px' }}
      >
        {/* YouTube iframe (active) or thumbnail (inactive) */}
        {isActive && iframeSrc ? (
          <iframe
            key={`${video.videoId}-${globalMuted}`}
            src={iframeSrc}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Bottom gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)',
            height: '60%'
          }}
        />

        {/* Video info — bottom left */}
        <div
          className="absolute left-0 right-14 px-4 pointer-events-auto"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)' }}
        >
          <Link
            to={`/channel/${video.channelId}`}
            className="text-white font-bold text-sm mb-1 block hover:underline truncate"
          >
            @{video.channelTitle || 'Creator'}
          </Link>
          <p className="text-white/90 text-sm line-clamp-2 leading-snug">{video.title}</p>
        </div>

        {/* Sound toggle — bottom left */}
        <button
          onClick={onToggleMute}
          className="absolute left-4 pointer-events-auto z-10"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 48px)' }}
          title={globalMuted ? 'Tap for sound' : 'Mute'}
        >
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors
            ${globalMuted ? 'bg-white/20 border border-white/40' : 'bg-white/15'}`}>
            {globalMuted
              ? <><VolumeX size={14} className="text-white" /><span className="text-white text-xs font-medium">Tap for sound</span></>
              : <Volume2 size={16} className="text-white" />
            }
          </div>
        </button>

        {/* Action buttons — right side */}
        <div
          className="absolute right-3 flex flex-col items-center gap-5 pointer-events-auto"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)' }}
        >
          <button onClick={toggleLike} className="flex flex-col items-center gap-1">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors
              ${liked ? 'bg-red-500' : 'bg-black/50 hover:bg-black/70'}`}>
              <ThumbsUp size={20} className="text-white" />
            </div>
            <span className="text-white text-xs font-medium">{liked ? 'Liked' : 'Like'}</span>
          </button>

          <button
            onClick={() => toast('Open full video to comment')}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors">
              <MessageSquare size={20} className="text-white" />
            </div>
            <span className="text-white text-xs font-medium">Comment</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(`${window.location.origin}/watch/${video.videoId}`);
              toast.success('Link copied!');
            }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors">
              <Share2 size={20} className="text-white" />
            </div>
            <span className="text-white text-xs font-medium">Share</span>
          </button>

          <button onClick={toggleSubscribe} className="flex flex-col items-center gap-1">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors
              ${subscribed ? 'bg-green-500' : 'bg-black/50 hover:bg-black/70'}`}>
              <Bell size={20} className="text-white" />
            </div>
            <span className="text-white text-xs font-medium">{subscribed ? 'Subbed' : 'Subscribe'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Shorts Page ──────────────────────────────────────────────────── */
export default function Shorts() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextPageToken, setNextPageToken] = useState('');
  const [nextQueryIndex, setNextQueryIndex] = useState(0);
  const [seenIds, setSeenIds] = useState(new Set());

  // Global audio state — persisted in localStorage
  const [globalMuted, setGlobalMuted] = useState(() => !getAudioPref());

  const containerRef = useRef(null);
  const isLoadingMoreRef = useRef(false);

  // Toggle mute globally and persist
  const handleToggleMute = useCallback(() => {
    setGlobalMuted(prev => {
      const next = !prev;
      saveAudioPref(!next); // if muted=false, audio=true
      return next;
    });
  }, []);

  // Deduplicate helper
  const dedupe = useCallback((newVideos, existingIds) => {
    const added = [];
    const updatedIds = new Set(existingIds);
    for (const v of newVideos) {
      if (!v.videoId || updatedIds.has(v.videoId)) continue;
      updatedIds.add(v.videoId);
      added.push(v);
    }
    return { added, updatedIds };
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    setError(null);
    getShorts('', 0)
      .then(data => {
        const { added, updatedIds } = dedupe(data.videos || [], new Set());
        setVideos(added);
        setSeenIds(updatedIds);
        setNextPageToken(data.nextPageToken || '');
        setNextQueryIndex(data.queryIndex ?? 1);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Load more videos
  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      // Try same query with next page first, then rotate query
      const data = await getShorts(nextPageToken || '', nextQueryIndex);
      const { added, updatedIds } = dedupe(data.videos || [], seenIds);
      if (added.length > 0) {
        setVideos(prev => [...prev, ...added]);
        setSeenIds(updatedIds);
      }
      setNextPageToken(data.nextPageToken || '');
      setNextQueryIndex(data.queryIndex ?? (nextQueryIndex + 1));
    } catch {
      // Retry with a fresh query rotation
      try {
        const data2 = await getShorts('', (nextQueryIndex + 2) % 26);
        const { added, updatedIds } = dedupe(data2.videos || [], seenIds);
        setVideos(prev => [...prev, ...added]);
        setSeenIds(updatedIds);
        setNextPageToken(data2.nextPageToken || '');
        setNextQueryIndex(data2.queryIndex ?? 0);
      } catch {}
    } finally {
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [nextPageToken, nextQueryIndex, seenIds, dedupe]);

  // Scroll detection
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const idx = Math.round(el.scrollTop / vh);
        const clamped = Math.max(0, Math.min(idx, videos.length - 1));
        setActiveIndex(clamped);
        // Load more when 3 from end
        if (videos.length > 0 && clamped >= videos.length - 3) loadMore();
        ticking = false;
      });
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [videos.length, loadMore]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      const el = containerRef.current;
      if (!el) return;
      if (e.key === 'ArrowDown' || e.key === 'j') el.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      else if (e.key === 'ArrowUp' || e.key === 'k') el.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
      else if (e.key === 'm') handleToggleMute();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleToggleMute]);

  const scrollNav = (dir) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ top: dir === 'up' ? -window.innerHeight : window.innerHeight, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="bg-black flex items-center justify-center" style={{ height: '100dvh' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white/60 text-sm">Loading Shorts...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-black flex items-center justify-center" style={{ height: '100dvh' }}>
      <div className="text-center px-6">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <p className="text-white font-semibold mb-2">Failed to load Shorts</p>
        <p className="text-white/60 text-sm mb-6 max-w-xs mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold mx-auto hover:bg-white/90 transition-colors"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    </div>
  );

  if (!loading && videos.length === 0) return (
    <div className="bg-black flex items-center justify-center" style={{ height: '100dvh' }}>
      <div className="text-center px-6">
        <p className="text-white font-semibold mb-4">No Shorts found</p>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold mx-auto">
          <Home size={16} /> Go Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative bg-black" style={{ height: '100dvh', overflow: 'hidden' }}>

      {/* Home link */}
      <Link
        to="/"
        className="fixed top-3 left-3 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium hover:bg-black/80 transition-colors"
      >
        <Home size={13} /> VidFlow
      </Link>

      {/* Progress counter */}
      <div className="fixed top-3 right-3 z-50 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
        <span className="text-white text-xs font-medium">{activeIndex + 1} / {videos.length}</span>
      </div>

      {/* Desktop nav arrows */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-2 z-50">
        <button
          onClick={() => scrollNav('up')}
          disabled={activeIndex === 0}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
        >
          <ChevronUp size={20} className="text-white" />
        </button>
        <button
          onClick={() => scrollNav('down')}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
        >
          <ChevronDown size={20} className="text-white" />
        </button>
      </div>

      {/* Scrollable feed */}
      <div
        ref={containerRef}
        className="shorts-container"
        style={{
          height: '100dvh',
          overflowY: 'scroll',
          overflowX: 'hidden',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {videos.map((video, i) => (
          <ShortCard
            key={`${video.videoId}-${i}`}
            video={video}
            isActive={i === activeIndex}
            globalMuted={globalMuted}
            onToggleMute={handleToggleMute}
            onVisible={() => setActiveIndex(i)}
          />
        ))}

        {/* Load more spinner */}
        {loadingMore && (
          <div
            className="snap-start flex-shrink-0 flex items-center justify-center bg-black"
            style={{ height: '100dvh' }}
          >
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-white/60 text-xs">Loading more...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
