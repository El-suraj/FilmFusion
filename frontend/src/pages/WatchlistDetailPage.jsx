import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard'; // To display movies in the watchlist

const WatchlistDetailPage = () => {
    const { id } = useParams(); // Get watchlist ID from URL
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [watchlist, setWatchlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchWatchlistDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/watchlists/${id}`);
                setWatchlist(response.data);
            } catch (err) {
                console.error(`Error fetching watchlist ${id}:`, err.response?.data?.message || err.message);
                setError(err.response?.data?.message || 'Failed to fetch watchlist details.');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && !authLoading && id) {
            fetchWatchlistDetails();
        }
    }, [id, isAuthenticated, authLoading, navigate]);

    // Function to handle removing a movie from this watchlist
    const handleRemoveMovieFromWatchlist = async (movieId) => {
        if (window.confirm('Are you sure you want to remove this movie from the watchlist?')) {
            try {
                const response = await api.put(`/watchlists/${id}/remove-movie`, { movieId });
                // Update the local state to reflect the removal
                setWatchlist(response.data.watchlist); // Backend should return the updated watchlist
                // Alternatively, filter locally:
                // setWatchlist(prev => ({
                //     ...prev,
                //     movies: prev.movies.filter(movie => movie.id !== movieId)
                // }));
                // Optionally, show a toast notification
            } catch (err) {
                console.error('Error removing movie:', err.response?.data?.message || err.message);
                alert(`Failed to remove movie: ${err.response?.data?.message || 'Server error'}`);
            }
        }
    };


    if (authLoading || loading) {
        return<div className="container">
            <div className="loading-message">Loading WatchLists details...</div>
            <div className="loading-spinner"></div> {/* Optional spinner */}
        </div>
    }

    if (error) {
        return <div className="container error-message">Error: {error}</div>;
    }

    if (!watchlist) {
        return <div className="container">Watchlist not found.</div>;
    }

    return (
        <div className="container">
            <h2>{watchlist.name}</h2>
            <p>{watchlist.description || 'No description provided.'}</p>

            <h3>Movies in this Watchlist ({watchlist.movies.length})</h3>
            {watchlist.movies.length === 0 ? (
                <p>No movies in this watchlist yet.</p>
            ) : (
                <div className="movie-grid">
                    {watchlist.movies.map((movie) => (
                        <div key={movie.id} className="watchlist-movie-item">
                            <MovieCard movie={movie} /> {/* Re-use MovieCard */}
                            <button
                                onClick={() => handleRemoveMovieFromWatchlist(movie.id)}
                                className="btn remove-from-watchlist-btn"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchlistDetailPage;