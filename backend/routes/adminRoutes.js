const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getSystemStats,
  getUserGrowth,
  getTournamentStats,
  getRevenueReport,
  getPopularCategories,
  getRecentActivities
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getSystemStats);
router.get('/reports/overview', getSystemStats);
router.get('/reports/users', getUserGrowth);
router.get('/reports/tournaments', getTournamentStats);
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/categories', getPopularCategories);
router.get('/reports/activities', getRecentActivities);

module.exports = router;