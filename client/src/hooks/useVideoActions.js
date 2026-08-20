import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function useVideoActions(video) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!user || !video?.videoId) return;
    api.get(`/likes/check/${video.videoId}`).then(r => setLiked(r.data.liked)).catch(() => {});
    api.get(`/watch-later/check/${video.videoId}`).then(r => setSaved(r.data.saved)).catch(() => {});
    if (video.channelId) {
      api.get('/subscriptions').then(r => {
        setSubscribed(r.data.channels?.includes(video.channelId));
      }).catch(() => {});
    }
  }, [user, video?.videoId, video?.channelId]);

  const toggleLike = async () => {
    if (!user) { toast.error('Sign in to like videos'); return; }
    try {
      const res = await api.post('/likes', { videoId: video.videoId, metadata: { title: video.title, thumbnail: video.thumbnail, channelName: video.channelTitle, channelId: video.channelId, duration: video.duration } });
      setLiked(res.data.liked);
      toast.success(res.data.liked ? 'Added to Liked Videos' : 'Removed from Liked Videos');
    } catch (err) { toast.error(err.message); }
  };

  const toggleSave = async () => {
    if (!user) { toast.error('Sign in to save videos'); return; }
    try {
      if (saved) {
        await api.delete(`/watch-later/${video.videoId}`);
        setSaved(false);
        toast.success('Removed from Watch Later');
      } else {
        await api.post('/watch-later', { videoId: video.videoId, metadata: { title: video.title, thumbnail: video.thumbnail, channelName: video.channelTitle, channelId: video.channelId, duration: video.duration } });
        setSaved(true);
        toast.success('Saved to Watch Later');
      }
    } catch (err) { toast.error(err.message); }
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
        toast.success(`Subscribed to ${video.channelTitle}`);
      }
    } catch (err) { toast.error(err.message); }
  };

  return { liked, saved, subscribed, toggleLike, toggleSave, toggleSubscribe };
}
