import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, MessageSquare, Share2, Bell, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getShorts } from '../services/videoService';
import useVideoActions from '../hooks/useVideoActions';
import toast from 'react-hot-toast';

function ShortCard({ video, isActive }) {
  const { liked, subscribed, toggleLike, toggleSubscribe } = useVideoActions(video);
  return (
    <div className="relative flex items-center justify-center h-screen snap-start bg-black">
      <div className="relative h-full max-w-sm w-full mx-auto">
        {isActive ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&loop=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        )}
        {/* Overlay info */}
        <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <Link to={`/channel/${video.channelId}`} className="text-white font-semibold text-sm mb-1 block hover:underline">
            @{video.channelTitle}
          </Link>
          <p className="text-white text-sm line-clamp-2">{video.title}</p>
        </div>
        {/* Action buttons */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-5">
          <button onClick={toggleLike} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${liked ? 'bg-blue-500' : 'bg-white/20 hover:bg-white/30'} transition-colors`}>
              <ThumbsUp size={18} className="text-white" />
            </div>
            <span className="text-white text-xs">{liked ? 'Liked' : 'Like'}</span>
          </button>
          <button onClick={() => toast('Comments coming soon')} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <MessageSquare size={18} className="text-white" />
            </div>
            <span className="text-white text-xs">Comment</span>
          </button>
          <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/watch/${video.videoId}`); toast.success('Link copied!'); }}
            className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <Share2 size={18} className="text-white" />
            </div>
            <span className="text-white text-xs">Share</span>
          </button>
          <button onClick={toggleSubscribe} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${subscribed ? 'bg-green-500' : 'bg-white/20 hover:bg-white/30'} transition-colors`}>
              <Bell size={18} className="text-white" />
            </div>
            <span className="text-white text-xs">{subscribed ? 'Subscribed' : 'Subscribe'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    getShorts().then(r => { setShorts(r.videos || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => {
      const idx = Math.round(el.scrollTop / window.innerHeight);
      setActiveIndex(idx);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (dir) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ top: dir === 'up' ? -window.innerHeight : window.innerHeight, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative bg-black">
      {/* Nav arrows desktop */}
      <div className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-50">
        <button onClick={() => scrollTo('up')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
          <ChevronUp size={20} className="text-white" />
        </button>
        <button onClick={() => scrollTo('down')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
          <ChevronDown size={20} className="text-white" />
        </button>
      </div>

      <div ref={containerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {shorts.map((video, i) => (
          <ShortCard key={video.videoId} video={video} isActive={i === activeIndex} />
        ))}
        {shorts.length === 0 && (
          <div className="h-screen flex items-center justify-center text-white">No shorts found.</div>
        )}
      </div>
    </div>
  );
}
