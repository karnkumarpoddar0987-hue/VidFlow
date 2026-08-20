const router = require('express').Router();
const { addHistory, getHistory, deleteHistory, clearHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addHistory);
router.get('/', protect, getHistory);
router.delete('/clear', protect, clearHistory);
router.delete('/:id', protect, deleteHistory);

module.exports = router;
