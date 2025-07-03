// frontend/src/components/MovieCard.jsx (Illustrative changes)
import React from "react";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth
import api from "../axiosConfig"; // Import your configured axios instance
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Example icons (npm install react-icons)

const MovieCard = ({ movie }) => {
  const { user, isAuthenticated } = useAuth(); // Get user and auth status
  const [isFavorited, setIsFavorited] = useState(false); // New state for favorite status

  // Function to check if movie is already favorited (run when user/movie changes)
  useEffect(() => {
    if (user && user.favoriteMovies && user.favoriteMovies.includes(movie.id)) {
      setIsFavorited(true);
    } else {
      setIsFavorited(false);
    }
  }, [user, movie.id]); // Re-run if user or movie changes

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      alert("Please log in to add to favorites!"); // Or redirect to login
      return;
    }

    try {
      if (isFavorited) {
        // Remove from favorites
        await api.delete(`/users/favorites/${movie.id}`);
        setIsFavorited(false);
        // Optimistically update user's favoriteMovies array in context/localStorage if you want
        // Or re-fetch user data if context updates are complex
        alert("Movie removed from favorites!");
      } else {
        // Add to favorites
        await api.post("/users/favorites", { movieId: movie.id });
        setIsFavorited(true);
        alert("Movie added to favorites!");
      }
      // IMPORTANT: You'll likely want to re-fetch the user's data or update the AuthContext's user state
      // to reflect the change in favoriteMovies array on successful toggle.
      // For simplicity, a full re-fetch of user data from /api/auth/me might be easiest after a toggle.
    } catch (error) {
      console.error(
        "Error toggling favorite:",
        error.response?.data?.message || error.message
      );
      alert(
        `Failed to toggle favorite: ${
          error.response?.data?.message || "Server error"
        }`
      );
    }
  };

  return (
    <div className="movie-card">
      {/* ... existing movie card content ... */}
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
      />
      <h3>{movie.title}</h3>
      <p>{movie.release_date}</p>

      {isAuthenticated && ( // Only show if authenticated
        <button onClick={handleFavoriteToggle} className="favorite-button">
          {isFavorited ? <FaHeart color="red" /> : <FaRegHeart />}
        </button>
      )}
    </div>
  );
};

export default MovieCard;
