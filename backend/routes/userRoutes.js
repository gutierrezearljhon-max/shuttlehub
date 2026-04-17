const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserStats,
  getCurrentUser,
  updateUserProfile,
  getLeaderboard
} = require('../controllers/userController');

// Protected routes
router.use(protect);

// Current user routes
router.get('/me', getCurrentUser);
router.put('/me', updateUserProfile);
router.get('/me/stats', getUserStats);

// Admin only routes
router.get('/', getUsers);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', authorize('admin'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/:id/role', authorize('admin'), updateUserRole);
router.get('/:id/stats', getUserStats);

module.exports = router;