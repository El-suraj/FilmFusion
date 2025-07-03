// authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // We need the User model to find the user by ID

const protect = async (req, res, next) => {
    let token;

    // Check if the Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID from the token payload and attach to request object
            // We select('-password') to exclude the password from the user object
            req.user = await User.findById(decoded.id).select('-password');

            // If user is found, proceed to the next middleware/route handler
            next();
        } catch (error) {
            console.error('Not authorized, token failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token is found in the header
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };