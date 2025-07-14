const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Import the protection middleware
const User = require('../models/User'); // Import the User model
const generateToken = require('../utils/generateToken'); // For generating new token if user data changes (e.g., email)
const axios = require('axios');
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const bcrypt = require('bcryptjs'); // <--- ADD THIS LINE

// Helper to structure user data for sending to frontend
const getUserDataForResponse = (user) => {
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        favoriteMovies: user.favoriteMovies,
        // Add any other profile fields you want the frontend to see
    };
};

// @desc    Get user's profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        // req.user is populated by the protect middleware with user ID
        const user = await User.findById(req.user._id).select('-password'); // Exclude password

        if (user) {
            res.json(getUserDataForResponse(user));
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Update username if provided and different
            if (username !== undefined && username !== user.username) {
                const existingUsername = await User.findOne({ username });
                if (existingUsername && String(existingUsername._id) !== String(user._id)) {
                    return res.status(400).json({ message: 'Username is already taken.' });
                }
                user.username = username;
            }

            // Update email if provided and different
            if (email !== undefined && email !== user.email) {
                const existingEmail = await User.findOne({ email });
                if (existingEmail && String(existingEmail._id) !== String(user._id)) {
                    return res.status(400).json({ message: 'Email is already taken.' });
                }
                user.email = email;
            }

            // Update password if provided
            if (password) {
                user.password = password; // Mongoose pre-save hook will hash this
            }

            const updatedUser = await user.save();

            // If email or username changed, you might want to issue a new token
            // to reflect the updated user info in the token payload if it's there.
            // For simplicity here, we're not re-issuing token unless explicitly needed.
            // If you *do* want to update token, modify generateToken to accept all necessary fields
            // and return it, then include `token: generateToken(updatedUser._id)` in response.
            // For now, let's just return the updated user data.

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                favoriteMovies: updatedUser.favoriteMovies,
                // If you re-generate token, include it here: token: generateToken(updatedUser._id)
            });

        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user profile:', error.message);
        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating profile.' });
    }
});


// Existing routes for favorites (no changes needed here, just for context)
// @desc    Get user's favorite movies
// @route   GET /api/users/favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => { /* ... */ });

// @desc    Add a movie to user's favorites
// @route   POST /api/users/favorites
// @access  Private
router.post('/favorites', protect, async (req, res) => { /* ... */ });

// @desc    Remove a movie from user's favorites
// @route   DELETE /api/users/favorites/:movieId
// @access  Private
router.delete('/favorites/:movieId', protect, async (req, res) => { /* ... */ });

module.exports = router;