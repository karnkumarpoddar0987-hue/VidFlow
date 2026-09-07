import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, Share2, Clock, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { getVideoById, getRelatedVideos } from '../services/videoService';
import { VideoCardSkeleton } from '../components/VideoSkeleton';
import VideoCard from '../components/VideoCard';
import CommentSection from '../components/CommentSection';
import useVideoActions from '../hooks/useVideoActions';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { format } from 'timeago.js';
import toast from 'react-hot-toast';

export default function Watch() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [showDesc, setShowDesc] = useState(false);
  const { liked, saved, subscribed, toggleLike, toggleSave, toggleSubscribe } = useVideoActions(video);

  useEffect(() => {
    setVideo(null);
    setRelated([]);
    setMetaLoading(true);

    // Use allSettled — YouTube player renders from videoId alone (URL param).
    // Metadata (title, views, related) loads in the background.
    // Nothing here touches MongoDB.
    Promise.allSettled([getVideoById(videoId), getRelatedVideos(videoId)])
      .then(([vRes, rRes]) => {
        if (vRes.status === 'fulfilled') setVideo(vRes.value);
        if (rRes.status === 'fulfilled') setRelated(rRes.value.videos || []);

        // Save to watch history — fire-and-forget, DB failure is silent
        if (user && vRes.status === 'fulfilled') {
          const v = vRes.value;
          api.post('/history', {
            videoId: v.videoId,
            title: v.title,
            thumbnail: v.thumbnail,
            channelName: v.channelTitle,
            channelId: v.channelId,
            duration: v.duration,
            viewCount: v.viewCount
          }).catch(() => {});
        }
      })
      .finally(() => setMetaLoading(false));
  }, [videoId]);

  // ── The iframe ALWAYS renders using videoId from the URL.
  // ── No MongoDB required. No loading gate in front of the player.
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 pb-20 md:pb-4 max-w-screen-xl mx-auto">

      {/* ── Main column ───────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* YouTube embed — always shown, uses videoId from URL */}
        <div className="aspect-video rounded-xl overflow-hidden bg-black mb-4 shadow-xl">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={video?.title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {/* Title skeleton until metadata loads */}
        {metaLoading ? (
          <div className="animate-pulse space-y-3 mb-4">
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
          </div>
        ) : (
          <>
            <h1 className="text-lg font-bold leading-snug mb-3">
              {video?.title || `Video: ${videoId}`}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                {video?.viewCount && <span>{video.viewCount} views</span>}
                {video?.publishedAt && <><span>•</span><span>{format(video.publishedAt)}</span></>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${liked ? 'bg-blue-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                >
                  <ThumbsUp size={16} /> {liked ? 'Liked' : 'Like'}
                  {video?.likeCount && <span className="text-xs opacity-70">{video.likeCount}</span>}
                </button>
                <button
                  onClick={toggleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${saved ? 'bg-blue-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                >
                  <Clock size={16} /> {saved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>

            {/* Channel */}
            {video?.channelId && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 mb-4">
                <Link to={`/channel/${video.channelId}`} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-semibold">
                    {video.channelTitle?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <p className="font-semibold text-sm">{video.channelTitle}</p>
                </Link>
                <button
                  onClick={toggleSubscribe}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors
                    ${subscribed
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90'}`}
                >
                  {subscribed ? <><Bell size={15} /> Subscribed</> : 'Subscribe'}
                </button>
              </div>
            )}

            {/* Description */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 mb-6">
              <p className={`text-sm leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 ${showDesc ? '' : 'line-clamp-3'}`}>
                {video?.description || 'No description available.'}
              </p>
              <button
                onClick={() => setShowDesc(p => !p)}
                className="mt-2 text-sm font-semibold flex items-center gap-1 hover:text-blue-500 transition-colors"
              >
                {showDesc ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show more</>}
              </button>
            </div>
          </>
        )}

        {/* Comments — DB feature, handles its own 503 gracefully */}
        <CommentSection videoId={videoId} />
      </div>

      {/* ── Related column ────────────────────────────────────────────── */}
      <div className="w-full lg:w-80 xl:w-96 shrink-0">
        <h2 className="font-semibold mb-3 text-sm">Recommended</h2>
        <div className="space-y-1">
          {metaLoading
            ? Array.from({ length: 6 }).map((_, i) => <VideoCardSkeleton key={i} horizontal />)
            : related.map(v => <VideoCard key={v.videoId} video={v} horizontal />)
          }
        </div>
      </div>
    </div>
  );
}
