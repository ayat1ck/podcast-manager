const express = require('express');
const router = express.Router();
const {
    createPodcast,
    getAllPodcasts,
    getPodcast,
    updatePodcast,
    deletePodcast,
    searchItunes
} = require('../controllers/podcastController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// All routes below are protected
router.use(protect);

// @route   GET /api/podcasts/search/itunes
// @desc    Search podcasts from iTunes API
// @access  Private
router.get('/search/itunes', searchItunes);

// @route   POST /api/podcasts
// @desc    Create a new podcast
// @access  Private
router.post('/', validate('createPodcast'), createPodcast);

// @route   GET /api/podcasts
// @desc    Get all user podcasts
// @access  Private
router.get('/', getAllPodcasts);

// @route   GET /api/podcasts/:id
// @desc    Get a specific podcast
// @access  Private
router.get('/:id', getPodcast);

// @route   PUT /api/podcasts/:id
// @desc    Update a podcast
// @access  Private
router.put('/:id', validate('updatePodcast'), updatePodcast);

// @route   DELETE /api/podcasts/:id
// @desc    Delete a podcast
// @access  Private
router.delete('/:id', deletePodcast);

module.exports = router;
