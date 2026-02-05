const User = require('../models/User');

// @desc    Get logged-in user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { username, email } = req.body;

        // Check if at least one field is provided
        if (!username && !email) {
            res.status(400);
            throw new Error('Please provide username or email to update');
        }

        // Check if new email already exists (if email is being changed)
        if (email && email !== req.user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                res.status(400);
                throw new Error('Email is already in use');
            }
        }

        // Check if new username already exists (if username is being changed)
        if (username && username !== req.user.username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) {
                res.status(400);
                throw new Error('Username is already taken');
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { username, email },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile };
