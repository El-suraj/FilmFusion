// backend/server.js
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const userRoutes = require('./routes/userRoutes'); // NEW: Import user routes
const watchlistRoutes = require('./routes/watchlistRoutes'); 
const reviewRoutes = require('./routes/reviewRoutes');



console.log('TMDB_API_KEY from .env:', process.env.TMDB_API_KEY);

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Movie Recommendation API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/users', userRoutes); // NEW: Use user routes
app.use('/api/watchlists', watchlistRoutes);
app.use('/api/reviews', reviewRoutes); // NEW: Use review routes


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke on the server!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));