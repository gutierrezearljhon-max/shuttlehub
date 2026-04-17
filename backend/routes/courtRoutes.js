const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt,
  updateCourtStatus,
  getAvailableCourts
} = require('../controllers/courtController');

// Public routes
router.get('/', getCourts);
router.get('/available', getAvailableCourts);
router.get('/:id', getCourtById);

// Protected routes
router.use(protect);

// Admin/Organizer only
router.post('/', authorize('admin', 'organizer'), createCourt);
router.put('/:id', authorize('admin', 'organizer'), updateCourt);
router.delete('/:id', authorize('admin'), deleteCourt);
router.put('/:id/status', authorize('admin', 'organizer'), updateCourtStatus);

module.exports = router;