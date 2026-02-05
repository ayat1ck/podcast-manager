const Podcast = require('../models/Podcast');
const { searchItunesPodcasts } = require('../utils/itunesApi');

// @desc    Create a new podcast
// @route   POST /api/podcasts
// @access  Private
const createPodcast = async (req, res, next) => {
    try {
        const { title, author, description, imageUrl, rating, status } = req.body;

        const podcast = await Podcast.create({
            title,
            author,
            description,
            imageUrl,
            rating,
            status,
            userId: req.user._id
        });

        res.status(201).json({
            success: true,
            data: podcast
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all podcasts for logged-in user
// @route   GET /api/podcasts
// @access  Private
const getAllPodcasts = async (req, res, next) => {
    try {
        const podcasts = await Podcast.find({ userId: req.user._id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: podcasts.length,
            data: podcasts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single podcast by ID
// @route   GET /api/podcasts/:id
// @access  Private
const getPodcast = async (req, res, next) => {
    try {
        const podcast = await Podcast.findById(req.params.id);

        if (!podcast) {
            res.status(404);
            throw new Error('Podcast not found');
        }

        // Check if podcast belongs to user
        if (podcast.userId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to access this podcast');
        }

        res.json({
            success: true,
            data: podcast
        });
    } catch (error) {
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            res.status(404);
            return next(new Error('Podcast not found'));
        }
        next(error);
    }
};

// @desc    Update a podcast
// @route   PUT /api/podcasts/:id
// @access  Private
const updatePodcast = async (req, res, next) => {
    try {
        let podcast = await Podcast.findById(req.params.id);

        if (!podcast) {
            res.status(404);
            throw new Error('Podcast not found');
        }

        // Check if podcast belongs to user
        if (podcast.userId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this podcast');
        }

        podcast = await Podcast.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: podcast
        });
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            return next(new Error('Podcast not found'));
        }
        next(error);
    }
};

// @desc    Delete a podcast
// @route   DELETE /api/podcasts/:id
// @access  Private
const deletePodcast = async (req, res, next) => {
    try {
        const podcast = await Podcast.findById(req.params.id);

        if (!podcast) {
            res.status(404);
            throw new Error('Podcast not found');
        }

        // Check if podcast belongs to user
        if (podcast.userId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to delete this podcast');
        }

        await Podcast.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Podcast deleted successfully',
            data: {}
        });
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            return next(new Error('Podcast not found'));
        }
        next(error);
    }
};

// @desc    Search podcasts from iTunes API
// @route   GET /api/podcasts/search/itunes
// @access  Private
const searchItunes = async (req, res, next) => {
    try {
        const { term, limit } = req.query;

        if (!term) {
            res.status(400);
            throw new Error('Search term is required');
        }

        const podcasts = await searchItunesPodcasts(term, limit || 10);

        res.json({
            success: true,
            count: podcasts.length,
            data: podcasts
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPodcast,
    getAllPodcasts,
    getPodcast,
    updatePodcast,
    deletePodcast,
    searchItunes
};
