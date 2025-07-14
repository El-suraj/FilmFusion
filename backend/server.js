// backend/server.js
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const userRoutes = require("./routes/userRoutes"); // NEW: Import user routes
const watchlistRoutes = require("./routes/watchlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

console.log("TMDB_API_KEY from .env:", process.env.TMDB_API_KEY);

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Movie Recommendation API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes); // NEW: Use user routes
app.use("/api/watchlists", watchlistRoutes);
app.use("/api/reviews", reviewRoutes); // NEW: Use review routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke on the server!");
});

// Set up CORS
const allowedOrigins = [
  "http://localhost:3000", // For local development
  process.env.FRONTEND_URL, // Your deployed Netlify URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // If you use cookies or auth headers that require credentials
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
