// frontend/src/components/MovieCard.jsx (Illustrative changes for adding to watchlist)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../axiosConfig';
import { FaHeart, FaRegHeart, FaPlusCircle } from 'react-icons/fa'; // Add FaPlusCircle for watchlist
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    const { user, isAuthenticated } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);
    const [userWatchlists, setUserWatchlists] = useState([]); // State to store user's watchlists
    const [showWatchlistDropdown, setShowWatchlistDropdown] = useState(false); // State for dropdown visibility
    const { showToast } = useToast();

    // Fetch user's watchlists when component mounts or user changes
    useEffect(() => {
        const fetchUserWatchlists = async () => {
            if (isAuthenticated && user) {
                try {
                    const { data } = await api.get('/watchlists');
                    setUserWatchlists(data);
                } catch (error) {
                    console.error('Error fetching user watchlists:', error.response?.data?.message || error.message);
                }
            } else {
                setUserWatchlists([]); // Clear if not authenticated
            }
        };
        fetchUserWatchlists();
    }, [isAuthenticated, user]); // Re-fetch when auth status or user changes

    useEffect(() => {
        if (user && user.favoriteMovies && user.favoriteMovies.includes(movie.id)) {
            setIsFavorited(true);
        } else {
            setIsFavorited(false);
        }
    }, [user, movie.id]);

    const handleFavoriteToggle = async () => {
        if (!isAuthenticated) {
            showToast('Please log in to add favorites.', 'info'); // NEW: Info toast
            return;
        }
        try {
            // ... (your existing favorite toggle logic) ...
            if (isFavorited) {
                await api.delete(`/users/${user.id}/favorites/${movie.id}`);
                showToast(`${movie.title} removed from favorites.`, 'info'); // NEW: Info toast
            } else {
                await api.post(`/users/${user.id}/favorites`, { movieId: movie.id, movieTitle: movie.title, moviePoster: movie.poster_path });
                showToast(`${movie.title} added to favorites!`, 'success'); // NEW: Success toast
            }
            setIsFavorited(!isFavorited); // Toggle local state
        } catch (error) {
            console.error('Error toggling favorite:', error.response?.data?.message || error.message);
            showToast('Failed to toggle favorite.', 'error'); // NEW: Error toast
        }
    };

    // Example: Update handleAddToWatchlist (when a watchlist is selected)
    const handleAddToWatchlist = async (watchlistId, watchlistName) => {
        if (!isAuthenticated) {
            showToast('Please log in to add to watchlists.', 'info');
            return;
        }
        try {
            await api.post(`/watchlists/${watchlistId}/movies`, { movieId: movie.id, movieTitle: movie.title, moviePoster: movie.poster_path });
            showToast(`${movie.title} added to "${watchlistName}".`, 'success'); // NEW: Success toast
            setShowWatchlistDropdown(false); // Close dropdown after selection
        } catch (error) {
            console.error('Error adding to watchlist:', error.response?.data?.message || error.message);
            showToast('Failed to add movie to watchlist (it might already be there).', 'error'); // NEW: Error toast
        }
    };
  

    return (
        <div className="movie-card">
          <Link to={`/movies/${movie.id}`} className="movie-card-link"> {/* NEW: Add Link */}
                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                <h3>{movie.title}</h3>
                <p>{movie.release_date}</p>
            </Link>

            {isAuthenticated && (
                <div className="movie-actions">
                    <button onClick={handleFavoriteToggle} className="favorite-button">
                        {isFavorited ? <FaHeart color="red" /> : <FaRegHeart />}
                    </button>
                    <div className="watchlist-dropdown-container">
                        <button onClick={() => setShowWatchlistDropdown(!showWatchlistDropdown)} className="add-to-watchlist-btn">
                            <FaPlusCircle /> Add to Watchlist
                        </button>
                        {showWatchlistDropdown && (
                            <div className="watchlist-dropdown-menu">
                                {userWatchlists.length === 0 ? (
                                    <p>No watchlists. Create one!</p>
                                ) : (
                                    userWatchlists.map(wl => (
                                        <div key={wl._id} className="dropdown-item" onClick={() => handleAddToWatchlist(wl._id)}>
                                            {wl.name}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieCard;