const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getMatches,
  getMatchById,
  updateMatchScore,
  completeMatch,
  getMyMatches,
  getTournamentMatches,
  scheduleMatch,
  updateMatchStatus
} = require('../controllers/matchController');

// Protected routes
router.use(protect);

// Player routes
router.get('/my-matches', getMyMatches);
router.get('/tournament/:tournamentId', getTournamentMatches);

// Match CRUD
router.get('/', authorize('admin', 'organizer'), getMatches);
router.get('/:id', getMatchById);
router.put('/:id/score', authorize('organizer', 'admin'), updateMatchScore);
router.put('/:id/complete', authorize('organizer', 'admin'), completeMatch);
router.put('/:id/status', authorize('organizer', 'admin'), updateMatchStatus);
router.post('/schedule', authorize('organizer', 'admin'), scheduleMatch);

module.exports = router;