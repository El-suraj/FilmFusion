// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies'); // New import

dotenv.config();
// Add this line temporarily for debugging:
console.log('TMDB_API_KEY from .env:', process.env.TMDB_API_KEY);

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Movie Recommendation API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes); // New route mounting

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke on the server!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));