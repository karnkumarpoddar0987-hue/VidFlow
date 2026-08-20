import React, {
  useState, useEffect, useRef, useCallback
} from 'react';
import {
  ThumbsUp, MessageSquare, Share2, Bell,
  ChevronUp, ChevronDown, Play, Pause,
  Volume2, VolumeX, AlertCircle, RefreshCw, Home
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getShorts } from '../services/videoService';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

/* ─── Single Short Card ─── */
function ShortCard({ video, isActive, onVisible }) {
  const { user } = useAuth();
  const cardRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [iframeSrc, setIframeSrc] = useState('');

  // Build iframe src only when active
  useEffect(() => {
    if (isActive) {
      setIframeSrc(
        `https://www.youtube.com/embed/${video.videoId}` +
        `?autoplay=1&mute=${muted ? 1 : 0}&loop=1&rel=0&modestbranding=1` +
        `&playlist=${video.videoId}&playsinline=1&enablejsapi=1`
      );
    } else {
      // Clear iframe src to stop playback when not active
      setIframeSrc('');
    }
  }, [isActive, video.videoId]);

  // Re-build src when mute changes (only if active)
  useEffect(() => {
    if (!isActive) return;
    setIframeSrc(
      `https://www.youtube.com/embed/${video.videoId}` +
      `?autoplay=1&mute=${muted ? 1 : 0}&loop=1&rel=0&modestbranding=1` +
      `&playlist=${video.videoId}&playsinline=1&enablejsapi=1`
    );
  }, [muted]);

  // IntersectionObserver to detect when this card is visible
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisible(); },
      { threshold: 0.6 }
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
        metadata: { title: video.title, thumbnail: video.thumbnail, channelName: video.channelTitle, channelId: video.channelId }
      });
      setLiked(res.data.liked);
      toast.success(res.data.liked ? 'Liked!' : 'Unliked');
    } catch { toast.error('Failed'); }
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

  const handleShare = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/watch/${video.videoId}`);
    toast.success('Link copied!');
  };

  return (
    <div
      ref={cardRef}
      className="short-card snap-start snap-always relative flex items-center justify-center bg-black flex-shrink-0"
      style={{ height: '100dvh', width: '100%' }}
    >
      {/* Video container — centered, max 400px wide on desktop */}
      <div
        className="relative bg-black overflow-hidden"
        style={{
          height: '100dvh',
          width: '100%',
          maxWidth: '420px',
          margin: '0 auto'
        }}
      >
        {/* YouTube iframe or thumbnail */}
        {isActive && iframeSrc ? (
          <iframe
            key={`${video.videoId}-${muted}`}
            src={iframeSrc}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            style={{ pointerEvents: 'auto' }}
          />
        ) : (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Gradient overlay bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
            height: '55%'
          }}
        />

        {/* Video info — bottom left */}
        <div
          className="absolute left-0 right-14 px-4 pointer-events-auto"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
        >
          <Link
            to={`/channel/${video.channelId}`}
            className="text-white font-semibold text-sm mb-1 block hover:underline truncate"
          >
            @{video.channelTitle}
          </Link>
          <p className="text-white text-sm line-clamp-2 leading-snug">{video.title}</p>
        </div>

        {/* Mute button — bottom left corner */}
        <button
          onClick={() => setMuted(p => !p)}
          className="absolute left-4 pointer-events-auto"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)' }}
        >
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            {muted
              ? <VolumeX size={16} className="text-white" />
              : <Volume2 size={16} className="text-white" />
            }
          </div>
        </button>

        {/* Action buttons — right side */}
        <div
          className="absolute right-3 flex flex-col items-center gap-4 pointer-events-auto"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
        >
          {/* Like */}
          <button onClick={toggleLike} className="flex flex-col items-center gap-1">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors
              ${liked ? 'bg-red-500' : 'bg-black/40 hover:bg-black/60'}`}>
              <ThumbsUp size={20} className="text-white" fill={liked ? 'white' : 'none'} />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">{liked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => toast('Open full video to comment')}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center transition-colors">
              <MessageSquare size={20} className="text-white" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">Comment</span>
          </button>

          {/* Share */}
          <button onClick={handleShare} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center transition-colors">
              <Share2 size={20} className="text-white" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">Share</span>
          </button>

          {/* Subscribe */}
          <button onClick={toggleSubscribe} className="flex flex-col items-center gap-1">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors
              ${subscribed ? 'bg-green-500' : 'bg-black/40 hover:bg-black/60'}`}>
              <Bell size={20} className="text-white" fill={subscribed ? 'white' : 'none'} />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">{subscribed ? 'Subbed' : 'Subscribe'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Shorts Page ─── */
export default function Shorts() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextPageToken, setNextPageToken] = useState('');
  const [seenIds, setSeenIds] = useState(new Set());
  const containerRef = useRef(null);
  const isLoadingMoreRef = useRef(false);

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
    getShorts('', '')
      .then(data => {
        const { added, updatedIds } = dedupe(data.videos || [], new Set());
        setVideos(added);
        setSeenIds(updatedIds);
        setNextPageToken(data.nextPageToken || '');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Load more
  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !nextPageToken) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const data = await getShorts(nextPageToken, '');
      const { added, updatedIds } = dedupe(data.videos || [], seenIds);
      if (added.length > 0) {
        setVideos(prev => [...prev, ...added]);
        setSeenIds(updatedIds);
      }
      setNextPageToken(data.nextPageToken || '');
    } catch (e) {
      // Retry silently with different query
      try {
        const data2 = await getShorts('', '');
        const { added, updatedIds } = dedupe(data2.videos || [], seenIds);
        setVideos(prev => [...prev, ...added]);
        setSeenIds(updatedIds);
        setNextPageToken(data2.nextPageToken || '');
      } catch {}
    } finally {
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [nextPageToken, seenIds, dedupe]);

  // Scroll handler — detect active video + trigger load more
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
        setActiveIndex(Math.max(0, Math.min(idx, videos.length - 1)));

        // Load more when 3 videos from end
        if (videos.length > 0 && idx >= videos.length - 3) {
          loadMore();
        }
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
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        el.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        el.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const scrollTo = (dir) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ top: dir === 'up' ? -window.innerHeight : window.innerHeight, behavior: 'smooth' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-black flex items-center justify-center" style={{ height: '100dvh' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/60 text-sm">Loading Shorts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-black flex items-center justify-center" style={{ height: '100dvh' }}>
        <div className="text-center px-6">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">Failed to load Shorts</p>
          <p className="text-white/60 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold mx-auto hover:bg-white/90 transition-colors"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-black flex items-center justify-center" style={{ height: '100dvh' }}>
        <div className="text-center px-6">
          <p className="text-white font-semibold mb-4">No Shorts found</p>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold mx-auto">
            <Home size={16} /> Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black" style={{ height: '100dvh', overflow: 'hidden' }}>

      {/* Back to Home button */}
      <Link
        to="/"
        className="fixed top-3 left-3 z-50 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium hover:bg-black/80 transition-colors"
      >
        <Home size={14} /> VidFlow
      </Link>

      {/* Desktop nav arrows */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-2 z-50">
        <button
          onClick={() => scrollTo('up')}
          disabled={activeIndex === 0}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
        >
          <ChevronUp size={20} className="text-white" />
        </button>
        <button
          onClick={() => scrollTo('down')}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
        >
          <ChevronDown size={20} className="text-white" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="fixed top-3 right-3 z-50 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
        <span className="text-white text-xs font-medium">{activeIndex + 1} / {videos.length}</span>
      </div>

      {/* Scrollable container */}
      <div
        ref={containerRef}
        style={{
          height: '100dvh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          overflowX: 'hidden'
        }}
        className="shorts-container"
      >
        {videos.map((video, i) => (
          <ShortCard
            key={`${video.videoId}-${i}`}
            video={video}
            isActive={i === activeIndex}
            onVisible={() => setActiveIndex(i)}
          />
        ))}

        {/* Loading more indicator */}
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
