const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { wrapDB } = require('../middleware/dbErrorHandler');

exports.getComments = wrapDB(async (req, res) => {
  const comments = await Comment.find({ videoId: req.params.videoId, parentCommentId: null })
    .populate('userId', 'username avatar')
    .sort({ createdAt: -1 });
  const withReplies = await Promise.all(comments.map(async (c) => {
    const replies = await Comment.find({ parentCommentId: c._id })
      .populate('userId', 'username avatar')
      .sort({ createdAt: 1 });
    return { ...c.toObject(), replies };
  }));
  res.json({ comments: withReplies });
});

exports.addComment = wrapDB(async (req, res) => {
  const { text, parentCommentId } = req.body;
  const comment = await Comment.create({
    userId: req.user._id,
    videoId: req.params.videoId,
    text,
    parentCommentId: parentCommentId || null
  });
  const populated = await comment.populate('userId', 'username avatar');

  if (parentCommentId) {
    const parent = await Comment.findById(parentCommentId).populate('userId');
    if (parent && String(parent.userId._id) !== String(req.user._id)) {
      await Notification.create({
        userId: parent.userId._id,
        type: 'reply',
        message: `${req.user.username} replied to your comment`,
        link: `/watch/${req.params.videoId}`
      });
    }
  }

  res.status(201).json(populated);
});

exports.deleteComment = wrapDB(async (req, res) => {
  const comment = await Comment.findOne({ _id: req.params.id, userId: req.user._id });
  if (!comment) return res.status(404).json({ error: 'Comment not found or not authorized' });
  await Comment.deleteMany({ parentCommentId: comment._id });
  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
});

exports.likeComment = wrapDB(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  const idx = comment.likes.indexOf(req.user._id);
  if (idx === -1) comment.likes.push(req.user._id);
  else comment.likes.splice(idx, 1);
  await comment.save();
  res.json({ likes: comment.likes.length, liked: idx === -1 });
});
