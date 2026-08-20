const router = require('express').Router();
const { getChannel, getChannelVideos } = require('../controllers/channelController');

router.get('/:channelId', getChannel);
router.get('/:channelId/videos', getChannelVideos);

module.exports = router;
