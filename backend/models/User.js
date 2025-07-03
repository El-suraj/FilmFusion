
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Make sure you have bcryptjs installed: npm install bcryptjs

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },

        // NEW FIELD: Array to store favorite movie IDs
        // We'll store them as Numbers (TMDB movie IDs are typically numbers)
        favoriteMovies: {
            type: [Number], // An array of numbers
            default: [],    // Default to an empty array
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving (pre-save hook)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;