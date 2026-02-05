const axios = require('axios');

const ITUNES_API_URL = 'https://itunes.apple.com/search';

/**
 * Search podcasts from iTunes API
 * @param {string} term - Search term
 * @param {number} limit - Maximum number of results (default: 10)
 * @returns {Array} - Array of podcast objects
 */
const searchItunesPodcasts = async (term, limit = 10) => {
    try {
        const response = await axios.get(ITUNES_API_URL, {
            params: {
                term: term,
                media: 'podcast',
                limit: limit
            }
        });

        // Map iTunes response to simplified format
        const podcasts = response.data.results.map(podcast => ({
            itunesId: podcast.trackId,
            title: podcast.trackName,
            author: podcast.artistName,
            description: podcast.description || '',
            imageUrl: podcast.artworkUrl600 || podcast.artworkUrl100,
            feedUrl: podcast.feedUrl,
            genres: podcast.genres,
            releaseDate: podcast.releaseDate,
            episodeCount: podcast.trackCount
        }));

        return podcasts;
    } catch (error) {
        console.error('iTunes API Error:', error.message);
        throw new Error('Failed to fetch podcasts from iTunes');
    }
};

module.exports = { searchItunesPodcasts };
