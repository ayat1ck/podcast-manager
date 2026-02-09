const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Please add an author'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
        default: null
    },
    status: {
        type: String,
        enum: ['listening', 'completed', 'wishlist'],
        default: 'wishlist'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Podcast', podcastSchema);
