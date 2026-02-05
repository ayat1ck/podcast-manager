const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validate } = require('../middleware/validateMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate('register'), register);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', validate('login'), login);

module.exports = router;
