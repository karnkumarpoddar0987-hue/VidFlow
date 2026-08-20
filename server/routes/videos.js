const router = require('express').Router();
const { search, getById, getTrending, getRelated, getSuggestions, getShorts } = require('../controllers/videoController');
router.get('/', getTrending);
router.get('/search', search);
router.get('/trending', getTrending);
router.get('/shorts', getShorts);
router.get('/suggestions', getSuggestions);
router.get('/:videoId/related', getRelated);
router.get('/:videoId', getById);

module.exports = router;
