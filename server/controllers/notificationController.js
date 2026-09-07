const Notification = require('../models/Notification');
const { wrapDB } = require('../middleware/dbErrorHandler');

exports.getNotifications = wrapDB(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 }).limit(50);
  res.json({ notifications });
});

exports.markRead = wrapDB(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ message: 'All notifications marked as read' });
});

exports.markOneRead = wrapDB(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true }
  );
  res.json({ message: 'Notification marked as read' });
});
