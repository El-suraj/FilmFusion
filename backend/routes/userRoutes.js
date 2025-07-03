const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Import the protection middleware
const User = require('../models/User'); // Import the User model
const axios = require('axios'); // To fetch movie details from TMDB if needed
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// @desc    Get user's favorite movies
// @route   GET /api/users/favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => {
    try {
        // req.user is populated by the protect middleware
        const user = await User.findById(req.user._id).select('favoriteMovies');

        if (user) {
            // Optionally, fetch full movie details for each favorite ID from TMDB
            // This can be heavy if a user has many favorites. Consider pagination or fetching on demand.
            const favoriteMovieDetails = [];
            for (const movieId of user.favoriteMovies) {
                try {
                    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
                        params: { api_key: TMDB_API_KEY },
                    });
                    favoriteMovieDetails.push(response.data);
                } catch (movieError) {
                    console.warn(`Could not fetch details for movie ID ${movieId}:`, movieError.message);
                    // Optionally, add a placeholder or just skip this movie
                }
            }
            res.json(favoriteMovieDetails);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching favorites:', error.message);
        res.status(500).json({ message: 'Server error fetching favorite movies' });
    }
});

// @desc    Add a movie to user's favorites
// @route   POST /api/users/favorites
// @access  Private
router.post('/favorites', protect, async (req, res) => {
    const { movieId } = req.body;

    if (!movieId) {
        return res.status(400).json({ message: 'Movie ID is required.' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Check if movie is already in favorites to prevent duplicates
            if (!user.favoriteMovies.includes(movieId)) {
                user.favoriteMovies.push(movieId);
                await user.save();
                res.status(200).json({ message: 'Movie added to favorites', favorites: user.favoriteMovies });
            } else {
                res.status(409).json({ message: 'Movie already in favorites' }); // 409 Conflict
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error adding favorite:', error.message);
        res.status(500).json({ message: 'Server error adding movie to favorites' });
    }
});

// @desc    Remove a movie from user's favorites
// @route   DELETE /api/users/favorites/:movieId
// @access  Private
router.delete('/favorites/:movieId', protect, async (req, res) => {
    const movieId = parseInt(req.params.movieId); // Ensure it's a number

    if (isNaN(movieId)) {
        return res.status(400).json({ message: 'Valid Movie ID is required.' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const initialLength = user.favoriteMovies.length;
            user.favoriteMovies = user.favoriteMovies.filter(id => id !== movieId);

            if (user.favoriteMovies.length < initialLength) {
                await user.save();
                res.status(200).json({ message: 'Movie removed from favorites', favorites: user.favoriteMovies });
            } else {
                res.status(404).json({ message: 'Movie not found in favorites' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error removing favorite:', error.message);
        res.status(500).json({ message: 'Server error removing movie from favorites' });
    }
});

module.exports = router;