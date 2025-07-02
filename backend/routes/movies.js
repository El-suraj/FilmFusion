// backend/routes/movies.js
const express = require('express');
const router = express.Router();
const axios = require('axios'); // We need axios to make requests to TMDB

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Middleware to check for TMDB_API_KEY
router.use((req, res, next) => {
    if (!TMDB_API_KEY) {
        return res.status(500).json({ message: 'TMDB API Key not configured on the server.' });
    }
    next();
});

// @desc    Search movies by title
// @route   GET /api/movies/search
// @access  Public
router.get('/search', async (req, res) => {
    const { query } = req.query; // Get search query from URL parameter
    if (!query) {
        return res.status(400).json({ message: 'Search query is required.' });
    }
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                query: query,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error searching movies:', error.response?.data?.status_message || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Error fetching movies from TMDB.',
            details: error.response?.data,
        });
    }
});

// @desc    Get popular movies
// @route   GET /api/movies/popular
// @access  Public
router.get('/popular', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: TMDB_API_KEY,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching popular movies:', error.response?.data?.status_message || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Error fetching popular movies from TMDB.',
            details: error.response?.data,
        });
    }
});

// @desc    Get movie details by ID
// @route   GET /api/movies/:id
// @access  Public
router.get('/:id', async (req, res) => {
    const movieId = req.params.id; // Get movie ID from URL parameter
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: {
                api_key: TMDB_API_KEY,
                append_to_response: 'videos,credits,images,recommendations', // Fetch additional data
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching movie details for ID ${movieId}:`, error.response?.data?.status_message || error.message);
        if (error.response && error.response.status === 404) {
            res.status(404).json({ message: 'Movie not found.' });
        } else {
            res.status(error.response?.status || 500).json({
                message: 'Error fetching movie details from TMDB.',
                details: error.response?.data,
            });
        }
    }
});

module.exports = router;