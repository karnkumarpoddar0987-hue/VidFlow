const router = require('express').Router();
const { add, getAll, remove, check } = require('../controllers/watchLaterController');
const { protect } = require('../middleware/auth');

router.post('/', protect, add);
router.get('/', protect, getAll);
router.get('/check/:videoId', protect, check);
router.delete('/:videoId', protect, remove);

module.exports = router;
