const router = require('express').Router();
const { subscribe, unsubscribe, getSubscriptions, getSubscriptionFeed } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, subscribe);
router.delete('/:channelId', protect, unsubscribe);
router.get('/', protect, getSubscriptions);
router.get('/feed', protect, getSubscriptionFeed);

module.exports = router;
