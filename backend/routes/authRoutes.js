const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (authentication required)
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken); // Remove protect if public, or keep if protected
router.get('/me', protect, getMe);

module.exports = router;