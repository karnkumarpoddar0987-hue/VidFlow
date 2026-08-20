const router = require('express').Router();
const c = require('../controllers/playlistController');
const { protect } = require('../middleware/auth');

router.post('/', protect, c.create);
router.get('/', protect, c.getAll);
router.get('/:id', protect, c.getById);
router.put('/:id', protect, c.update);
router.delete('/:id', protect, c.deletePlaylist);
router.post('/:id/videos', protect, c.addVideo);
router.delete('/:id/videos/:videoId', protect, c.removeVideo);

module.exports = router;
