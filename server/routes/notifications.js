const router = require('express').Router();
const { getNotifications, markRead, markOneRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markRead);
router.put('/:id/read', protect, markOneRead);

module.exports = router;
