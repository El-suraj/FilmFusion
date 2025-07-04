const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Review = require('../models/Review');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
    const { movieId, rating, comment } = req.body;

    // Basic validation
    if (!movieId || !rating || !comment) {
        return res.status(400).json({ message: 'Please provide movie ID, rating, and comment.' });
    }
    if (rating < 1 || rating > 10) { // Adjust based on your chosen rating scale
        return res.status(400).json({ message: 'Rating must be between 1 and 10.' });
    }

    try {
        // Check if user already reviewed this movie
        const existingReview = await Review.findOne({ user: req.user._id, movieId });
        if (existingReview) {
            return res.status(409).json({ message: 'You have already reviewed this movie.' });
        }

        const review = await Review.create({
            user: req.user._id,
            movieId,
            rating,
            comment,
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error.message);
        res.status(500).json({ message: 'Server error creating review.' });
    }
});

// @desc    Get all reviews for a specific movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public (can be viewed by anyone)
router.get('/movie/:movieId', async (req, res) => {
    try {
        const reviews = await Review.find({ movieId: req.params.movieId })
                                    .populate('user', 'username') // Populate user field to get username
                                    .sort({ createdAt: -1 }); // Latest reviews first
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching movie reviews:', error.message);
        res.status(500).json({ message: 'Server error fetching reviews.' });
    }
});

// @desc    Get a user's review for a specific movie
// @route   GET /api/reviews/user/:movieId
// @access  Private (user can only see their own review for a movie)
router.get('/user/:movieId', protect, async (req, res) => {
    try {
        const review = await Review.findOne({ user: req.user._id, movieId: req.params.movieId })
                                    .populate('user', 'username');
        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }
        res.json(review);
    } catch (error) {
        console.error('Error fetching user\'s movie review:', error.message);
        res.status(500).json({ message: 'Server error fetching user review.' });
    }
});


// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (only the review owner can update)
router.put('/:id', protect, async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        // Ensure the logged-in user owns the review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this review.' });
        }

        review.rating = rating !== undefined ? rating : review.rating;
        review.comment = comment !== undefined ? comment : review.comment;

        if (review.rating < 1 || review.rating > 10) { // Adjust based on your chosen rating scale
            return res.status(400).json({ message: 'Rating must be between 1 and 10.' });
        }

        const updatedReview = await review.save();
        res.json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error.message);
        res.status(500).json({ message: 'Server error updating review.' });
    }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (only the review owner can delete)
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        // Ensure the logged-in user owns the review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this review.' });
        }

        await review.deleteOne(); // Use deleteOne() on the document itself
        res.json({ message: 'Review removed successfully.' });
    } catch (error) {
        console.error('Error deleting review:', error.message);
        res.status(500).json({ message: 'Server error deleting review.' });
    }
});

module.exports = router;