// frontend/src/components/MovieCard.jsx (Illustrative changes for adding to watchlist)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import api from '../axiosConfig';
import { FaHeart, FaRegHeart, FaPlusCircle } from 'react-icons/fa'; // Add FaPlusCircle for watchlist

const MovieCard = ({ movie }) => {
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast(); // NEW: Access showToast
    const [isFavorited, setIsFavorited] = useState(false);
    const [userWatchlists, setUserWatchlists] = useState([]); // State to store user's watchlists
    const [showWatchlistDropdown, setShowWatchlistDropdown] = useState(false); // State for dropdown visibility

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
            showToast('Please log in to add favorites.', 'info'); 
            return;
        }
        try {
            if (isFavorited) {
                await api.delete(`/users/favorites/${movie.id}`);
                showToast(`${movie.title} removed from favorites.`, 'info');
                // You'd want to update the user's favorites array in AuthContext here too
            } else {
                await api.post('/users/favorites', { movieId: movie.id });
                showToast(`${movie.title} added to favorites!`, 'success');
                // Update user's favorites array in AuthContext here too
            }
             setIsFavorited(!isFavorited);
            // Optional: Re-fetch user data to keep AuthContext in sync if you don't update locally
            // await loadUserFromToken(); // If you added this function to AuthContext
        } catch (error) {
            console.error('Error toggling favorite:', error.response?.data?.message || error.message);
           showToast('Failed to toggle favorite.', 'error'); 
        }
    };

    const handleAddToWatchlist = async (watchlistId) => {
        if (!isAuthenticated) {
            showToast('Please log in to add to watchlists.', 'info');
            return;
        }
        try {
            await api.put(`/watchlists/${watchlistId}/add-movie`, { movieId: movie.id });
           showToast(`${movie.title} added to "${watchlistName}".`, 'success'); // NEW: Success toast
            setShowWatchlistDropdown(false); // Close dropdown after selection
            // Optional: Update the specific watchlist in userWatchlists state
            // to reflect the change, or re-fetch all watchlists
        } catch (error) {
            console.error('Error adding to watchlist:', error.response?.data?.message || error.message);
            showToast('Failed to add movie to watchlist (it might already be there).', 'error'); // NEW: Error toast
        }
    };

    return (
        <div class="movie-grid">
        <div className="movie-card">
          <Link to={`/movies/${movie.id}`} className="movie-card-link">
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
        </div>
    );
};

export default MovieCard;