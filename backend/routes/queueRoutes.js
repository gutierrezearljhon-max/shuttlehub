const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  joinQueue,
  leaveQueue,
  getQueueStatus,
  getNextPlayers,
  rotateQueue,
  clearQueue,
  updateQueuePosition,
  getQueueHistory
} = require('../controllers/queueController');

// All queue routes are protected
router.use(protect);

// Queue management
router.post('/:courtId/join', joinQueue);
router.delete('/:courtId/leave', leaveQueue);
router.get('/:courtId/status', getQueueStatus);
router.get('/:courtId/next', getNextPlayers);
router.put('/:courtId/rotate', rotateQueue);
router.delete('/:courtId/clear', clearQueue);
router.put('/:courtId/position', updateQueuePosition);
router.get('/:courtId/history', getQueueHistory);

module.exports = router;