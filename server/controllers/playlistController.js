const Playlist = require('../models/Playlist');

exports.create = async (req, res) => {
  try {
    const playlist = await Playlist.create({ userId: req.user._id, name: req.body.name, description: req.body.description || '' });
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ playlists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name: req.body.name, description: req.body.description },
      { new: true }
    );
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    await Playlist.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addVideo = async (req, res) => {
  const { videoId, title, thumbnail, channelName, duration } = req.body;
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    const exists = playlist.videos.find(v => v.videoId === videoId);
    if (exists) return res.status(400).json({ error: 'Video already in playlist' });
    playlist.videos.push({ videoId, title, thumbnail, channelName, duration });
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeVideo = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    playlist.videos = playlist.videos.filter(v => v.videoId !== req.params.videoId);
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
