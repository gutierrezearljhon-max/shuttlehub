const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  registerPlayer,
  unregisterPlayer,
  getRegisteredPlayers,
  generateBracket,
  updateTournamentStatus,
  getMyTournaments,
  getAvailableTournaments
} = require('../controllers/tournamentController');

// Public routes
router.get('/', getTournaments);
router.get('/available', getAvailableTournaments);
router.get('/my-tournaments', protect, getMyTournaments);
router.get('/:id', getTournamentById);

// Protected routes
router.use(protect);

// Player routes
router.post('/:id/register', authorize('player'), registerPlayer);
router.delete('/:id/unregister', authorize('player'), unregisterPlayer);
router.get('/:id/players', getRegisteredPlayers);

// Organizer/Admin routes
router.post('/', authorize('admin', 'organizer'), createTournament);
router.put('/:id', authorize('admin', 'organizer'), updateTournament);
router.delete('/:id', authorize('admin'), deleteTournament);
router.post('/:id/generate-bracket', authorize('organizer', 'admin'), generateBracket);
router.put('/:id/status', authorize('organizer', 'admin'), updateTournamentStatus);

module.exports = router;