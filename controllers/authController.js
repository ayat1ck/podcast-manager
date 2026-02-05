const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists by email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            res.status(400);
            throw new Error('User with this email already exists');
        }

        // Check if username exists
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            res.status(400);
            throw new Error('Username is already taken');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate user (login)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            res.status(401);
            throw new Error('Invalid email or password');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(401);
            throw new Error('Invalid email or password');
        }

        res.json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
