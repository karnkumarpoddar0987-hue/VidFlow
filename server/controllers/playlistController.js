const Playlist = require('../models/Playlist');
const { wrapDB } = require('../middleware/dbErrorHandler');

exports.create = wrapDB(async (req, res) => {
  const playlist = await Playlist.create({
    userId: req.user._id,
    name: req.body.name,
    description: req.body.description || ''
  });
  res.status(201).json(playlist);
});

exports.getAll = wrapDB(async (req, res) => {
  const playlists = await Playlist.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ playlists });
});

exports.getById = wrapDB(async (req, res) => {
  const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  res.json(playlist);
});

exports.update = wrapDB(async (req, res) => {
  const playlist = await Playlist.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { name: req.body.name, description: req.body.description },
    { new: true }
  );
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  res.json(playlist);
});

exports.deletePlaylist = wrapDB(async (req, res) => {
  await Playlist.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ message: 'Playlist deleted' });
});

exports.addVideo = wrapDB(async (req, res) => {
  const { videoId, title, thumbnail, channelName, duration } = req.body;
  const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  if (playlist.videos.find(v => v.videoId === videoId)) {
    return res.status(400).json({ error: 'Video already in playlist' });
  }
  playlist.videos.push({ videoId, title, thumbnail, channelName, duration });
  await playlist.save();
  res.json(playlist);
});

exports.removeVideo = wrapDB(async (req, res) => {
  const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  playlist.videos = playlist.videos.filter(v => v.videoId !== req.params.videoId);
  await playlist.save();
  res.json(playlist);
});
