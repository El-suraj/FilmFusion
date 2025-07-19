// backend/controllers/reviewController.js
const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');

// Existing functions (submitReview, getMovieReviews, getUserReviewForMovie, updateReview, deleteReview) ...

// @desc    Get all reviews by the authenticated user
// @route   GET /api/reviews/me
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
    // req.user is set by the protect middleware
    const reviews = await Review.find({ userId: req.user.id })
                                .sort({ createdAt: -1 }) // Sort by newest first
                                .lean(); // Get plain JS objects

    // Optionally, you might want to fetch movie titles for these reviews if not stored directly
    // This depends on how much info you want to display on the profile page.
    // For now, let's return the reviews as is.
    res.status(200).json(reviews);
});

module.exports = {
    // ... your existing exports ...
    getUserReviews // NEW: Export getUserReviews
};