const router = require('express').Router();
const { likeVideo, getLiked, checkLike } = require('../controllers/likeController');
const { protect } = require('../middleware/auth');

router.post('/', protect, likeVideo);
router.get('/', protect, getLiked);
router.get('/check/:videoId', protect, checkLike);

module.exports = router;
