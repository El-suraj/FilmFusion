const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the User who wrote the review
            required: true,
            ref: 'User',
        },
        movieId: {
            type: Number, // The TMDB ID of the movie being reviewed
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1, // Minimum rating is 1
            max: 10, // Assuming a 1-10 rating scale (TMDB uses 0-10, common scales are 1-5 or 1-10)
        },
        comment: {
            type: String,
            required: true,
            maxlength: 500, // Limit review length
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Optional: Prevent a user from reviewing the same movie more than once
reviewSchema.index({ user: 1, movieId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;