const mongoose = require('mongoose');

const watchlistSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the User who owns this watchlist
            required: true,
            ref: 'User', // Refers to the 'User' model
        },
        name: {
            type: String,
            required: true,
            trim: true, // Remove whitespace from both ends of a string
            minlength: 3,
            maxlength: 100,
        },
        description: {
            type: String,
            maxlength: 500,
            default: '',
        },
        // Array to store movie IDs (TMDB IDs are numbers)
        movies: [
            {
                type: Number, // Stores the TMDB movie ID
                unique: true, // Ensure no duplicate movies in the same watchlist
            }
        ],
        isPublic: {
            type: Boolean,
            default: false, // Watchlists are private by default
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Optional: Add a compound unique index to prevent duplicate movie IDs within the same watchlist
// This ensures a movie ID is unique for a given user's watchlist.
// For this specific 'movies' array, we use `unique: true` on the inner type,
// which applies to the array elements themselves. If you want a movie to be in
// only ONE watchlist for a user, you'd need more complex logic.
// The current setup ensures no duplicate entry *within one specific watchlist's movie array*.

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;