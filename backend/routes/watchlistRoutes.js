const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Watchlist = require('../models/WatchList');
const axios = require('axios'); // For fetching movie details
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';


// Helper to fetch movie details (optional, but useful for returning full movie data)
const fetchMovieDetails = async (movieId) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: { api_key: TMDB_API_KEY },
        });
        return response.data;
    } catch (error) {
        console.warn(`Could not fetch details for movie ID ${movieId}:`, error.message);
        return null; // Return null if fetching fails
    }
};


// @desc    Create a new watchlist
// @route   POST /api/watchlists
// @access  Private
router.post('/', protect, async (req, res) => {
    const { name, description, isPublic } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Watchlist name is required.' });
    }

    try {
        const newWatchlist = await Watchlist.create({
            user: req.user._id, // User ID from the protect middleware
            name,
            description,
            isPublic: isPublic || false,
        });
        res.status(201).json(newWatchlist);
    } catch (error) {
        console.error('Error creating watchlist:', error.message);
        if (error.code === 11000) { // Duplicate key error (e.g., if you make name unique per user)
            return res.status(400).json({ message: 'A watchlist with this name already exists for this user.' });
        }
        res.status(500).json({ message: 'Server error creating watchlist.' });
    }
});

// @desc    Get all watchlists for the authenticated user
// @route   GET /api/watchlists
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const watchlists = await Watchlist.find({ user: req.user._id }).sort({ createdAt: -1 }); // Sort by creation date
        res.json(watchlists);
    } catch (error) {
        console.error('Error fetching watchlists:', error.message);
        res.status(500).json({ message: 'Server error fetching watchlists.' });
    }
});

// @desc    Get a specific watchlist by ID (for the authenticated user)
// @route   GET /api/watchlists/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });

        if (!watchlist) {
            return res.status(404).json({ message: 'Watchlist not found.' });
        }

        // Optionally, fetch full movie details for each movie ID in the watchlist
        const moviesWithDetails = [];
        for (const movieId of watchlist.movies) {
            const details = await fetchMovieDetails(movieId);
            if (details) {
                moviesWithDetails.push(details);
            }
        }
        res.json({ ...watchlist.toObject(), movies: moviesWithDetails });

    } catch (error) {
        console.error('Error fetching watchlist by ID:', error.message);
        res.status(500).json({ message: 'Server error fetching watchlist.' });
    }
});

// @desc    Add a movie to a watchlist
// @route   PUT /api/watchlists/:id/add-movie
// @access  Private
router.put('/:id/add-movie', protect, async (req, res) => {
    const { movieId } = req.body;
    const watchlistId = req.params.id;

    if (!movieId) {
        return res.status(400).json({ message: 'Movie ID is required.' });
    }

    try {
        const watchlist = await Watchlist.findOne({ _id: watchlistId, user: req.user._id });

        if (!watchlist) {
            return res.status(404).json({ message: 'Watchlist not found or you do not own it.' });
        }

        if (!watchlist.movies.includes(movieId)) {
            watchlist.movies.push(movieId);
            await watchlist.save();
            res.json({ message: 'Movie added to watchlist', watchlist });
        } else {
            res.status(409).json({ message: 'Movie already in this watchlist.' });
        }
    } catch (error) {
        console.error('Error adding movie to watchlist:', error.message);
        res.status(500).json({ message: 'Server error adding movie.' });
    }
});

// @desc    Remove a movie from a watchlist
// @route   PUT /api/watchlists/:id/remove-movie
// @access  Private
router.put('/:id/remove-movie', protect, async (req, res) => {
    const { movieId } = req.body;
    const watchlistId = req.params.id;

    if (!movieId) {
        return res.status(400).json({ message: 'Movie ID is required.' });
    }

    try {
        const watchlist = await Watchlist.findOne({ _id: watchlistId, user: req.user._id });

        if (!watchlist) {
            return res.status(404).json({ message: 'Watchlist not found or you do not own it.' });
        }

        const initialLength = watchlist.movies.length;
        watchlist.movies = watchlist.movies.filter(id => id !== movieId);

        if (watchlist.movies.length < initialLength) {
            await watchlist.save();
            res.json({ message: 'Movie removed from watchlist', watchlist });
        } else {
            res.status(404).json({ message: 'Movie not found in this watchlist.' });
        }
    } catch (error) {
        console.error('Error removing movie from watchlist:', error.message);
        res.status(500).json({ message: 'Server error removing movie.' });
    }
});

// @desc    Update a watchlist (e.g., change name/description/public status)
// @route   PUT /api/watchlists/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const { name, description, isPublic } = req.body;
    const watchlistId = req.params.id;

    try {
        const watchlist = await Watchlist.findOne({ _id: watchlistId, user: req.user._id });

        if (!watchlist) {
            return res.status(404).json({ message: 'Watchlist not found or you do not own it.' });
        }

        watchlist.name = name || watchlist.name;
        watchlist.description = description !== undefined ? description : watchlist.description; // Allow clearing description
        watchlist.isPublic = isPublic !== undefined ? isPublic : watchlist.isPublic;

        await watchlist.save();
        res.json({ message: 'Watchlist updated', watchlist });
    } catch (error) {
        console.error('Error updating watchlist:', error.message);
        res.status(500).json({ message: 'Server error updating watchlist.' });
    }
});


// @desc    Delete a watchlist
// @route   DELETE /api/watchlists/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const result = await Watchlist.deleteOne({ _id: req.params.id, user: req.user._id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Watchlist not found or you do not own it.' });
        }
        res.status(200).json({ message: 'Watchlist deleted successfully.' });
    } catch (error) {
        console.error('Error deleting watchlist:', error.message);
        res.status(500).json({ message: 'Server error deleting watchlist.' });
    }
});

module.exports = router;