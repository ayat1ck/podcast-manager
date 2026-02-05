const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// All routes below are protected
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get logged-in user profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', validate('updateProfile'), updateProfile);

module.exports = router;
