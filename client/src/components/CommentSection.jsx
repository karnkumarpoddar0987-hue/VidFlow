import React, { useState, useEffect } from 'react';
import { ThumbsUp, Trash2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'timeago.js';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function CommentItem({ comment, videoId, onDelete }) {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [likes, setLikes] = useState(comment.likes?.length || 0);
  const [liked, setLiked] = useState(comment.likes?.includes(user?._id));

  const handleLike = async () => {
    if (!user) { toast.error('Sign in to like comments'); return; }
    try {
      const res = await api.post(`/comments/${comment._id}/like`);
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch {}
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const res = await api.post(`/comments/${videoId}`, { text: replyText, parentCommentId: comment._id });
      setReplies(prev => [...prev, res.data]);
      setReplyText('');
      setReplying(false);
      setShowReplies(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
        {comment.userId?.username?.[0]?.toUpperCase() || 'U'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">{comment.userId?.username || 'User'}</span>
          <span className="text-xs text-zinc-400">{format(comment.createdAt)}</span>
        </div>
        <p className="text-sm leading-relaxed mb-2">{comment.text}</p>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <button onClick={handleLike} className={`flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors ${liked ? 'text-blue-500' : ''}`}>
            <ThumbsUp size={13} /> {likes > 0 && likes}
          </button>
          {user && (
            <button onClick={() => setReplying(p => !p)} className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
              Reply
            </button>
          )}
          {user && user._id === comment.userId?._id && (
            <button onClick={() => onDelete(comment._id)} className="text-red-400 hover:text-red-500 transition-colors flex items-center gap-1">
              <Trash2 size={12} /> Delete
            </button>
          )}
          {replies.length > 0 && (
            <button onClick={() => setShowReplies(p => !p)} className="flex items-center gap-1 text-blue-500 hover:text-blue-400">
              {showReplies ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {replying && (
          <div className="flex gap-2 mt-3">
            <input value={replyText} onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500"
            />
            <button onClick={handleReply} className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">Reply</button>
            <button onClick={() => setReplying(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          </div>
        )}

        {showReplies && replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
            {replies.map(r => (
              <div key={r._id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {r.userId?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold">{r.userId?.username}</span>
                    <span className="text-xs text-zinc-400">{format(r.createdAt)}</span>
                  </div>
                  <p className="text-sm">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/comments/${videoId}`).then(r => {
      setComments(r.data.comments || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [videoId]);

  const addComment = async () => {
    if (!text.trim()) return;
    if (!user) { toast.error('Sign in to comment'); return; }
    try {
      const res = await api.post(`/comments/${videoId}`, { text });
      setComments(prev => [res.data, ...prev]);
      setText('');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteComment = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments(prev => prev.filter(c => c._id !== id));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageSquare size={18} /> {comments.length} Comments
      </h3>

      {user ? (
        <div className="flex gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <input value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addComment()}
              placeholder="Add a comment..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500"
            />
            {text.trim() && (
              <div className="flex gap-2 mt-2 justify-end">
                <button onClick={() => setText('')} className="px-4 py-1.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                <button onClick={addComment} className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">Comment</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500">
          <Link to="/login" className="text-blue-500 hover:underline">Sign in</Link> to add a comment
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-32" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(c => (
            <CommentItem key={c._id} comment={c} videoId={videoId} onDelete={deleteComment} />
          ))}
          {comments.length === 0 && (
            <div className="text-center py-8 text-zinc-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
              <p>No comments yet. Be the first!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
