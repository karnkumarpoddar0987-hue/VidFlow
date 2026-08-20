const router = require('express').Router();
const { getComments, addComment, deleteComment, likeComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/:videoId', getComments);
router.post('/:videoId', protect, addComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);

module.exports = router;
