// backend/routes/movieRoutes.js

const express = require('express');
const router = express.Router();
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper to fetch TMDB genres (cache this in a real app)
let tmdbGenres = [];
const fetchTmdbGenres = async () => {
    if (tmdbGenres.length === 0) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
                params: { api_key: TMDB_API_KEY, language: 'en-US' }
            });
            tmdbGenres = response.data.genres;
            console.log('TMDB Genres fetched:', tmdbGenres);
        } catch (error) {
            console.error('Error fetching TMDB genres:', error.message);
        }
    }
};
// Call this once when the module loads
fetchTmdbGenres();


// @desc    Get popular movies from TMDB with pagination, genre filter, and sorting
// @route   GET /api/movies/popular
// @access  Public
router.get('/popular', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const genreId = req.query.genre;
    const sortBy = req.query.sort_by;

    const params = {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: page
    };

    if (genreId && tmdbGenres.some(genre => genre.id === parseInt(genreId))) {
        params.with_genres = genreId;
    }
    if (sortBy) {
        params.sort_by = sortBy;
    }

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
            params: params
        });
        res.json({
            results: response.data.results,
            page: response.data.page,
            total_pages: response.data.total_pages
        });
    } catch (error) {
        console.error('Error fetching popular movies from TMDB:', error.message);
        res.status(500).json({ message: 'Failed to fetch popular movies' });
    }
});

// @desc    Search movies by query from TMDB with pagination
// @route   GET /api/movies/search
// @access  Public
router.get('/search', async (req, res) => {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
                query: query,
                page: page,
                include_adult: false
            }
        });
        res.json({
            results: response.data.results,
            page: response.data.page,
            total_pages: response.data.total_pages
        });
    } catch (error) {
        console.error(`Error searching movies for query "${query}":`, error.message);
        res.status(500).json({ message: 'Failed to search movies' });
    }
});

// @desc    Get all movie genres from TMDB
// @route   GET /api/movies/genres
// @access  Public
router.get('/genres', async (req, res) => { // <-- THIS MUST COME BEFORE /:id
    if (tmdbGenres.length > 0) {
        return res.json(tmdbGenres);
    }
    // If for some reason not cached, try fetching again
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: { api_key: TMDB_API_KEY, language: 'en-US' }
        });
        tmdbGenres = response.data.genres; // Cache it
        res.json(tmdbGenres);
    } catch (error) {
        console.error('Error fetching genres:', error.message);
        res.status(500).json({ message: 'Failed to fetch genres' });
    }
});

// @desc    Get movie details by ID from TMDB
// @route   GET /api/movies/:id
// @access  Public
router.get('/:id', async (req, res) => { // <-- THIS MUST COME AFTER /genres
    try {
        const { id } = req.params;
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching movie details for ID ${req.params.id}:`, error.message);
        if (error.response && error.response.status === 404) {
            res.status(404).json({ message: 'Movie not found' });
        } else {
            res.status(500).json({ message: 'Failed to fetch movie details' });
        }
    }
});

module.exports = router;