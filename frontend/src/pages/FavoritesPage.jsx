// frontend/src/pages/FavoritesPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard'; // Re-use your MovieCard component
import { useNavigate } from 'react-router-dom'; // For redirection

const FavoritesPage = () => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not authenticated and auth loading is complete
        if (!authLoading && !isAuthenticated) {
            navigate('/login'); // Or any other desired redirect
            return;
        }

        const fetchFavorites = async () => {
            if (!user) { // Don't try to fetch if user isn't loaded yet
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/users/favorites');
                setFavoriteMovies(response.data);
            } catch (err) {
                console.error('Error fetching favorite movies:', err.response?.data?.message || err.message);
                setError(err.response?.data?.message || 'Failed to fetch favorite movies.');
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if user is authenticated and not currently loading auth
        if (isAuthenticated && !authLoading) {
            fetchFavorites();
        }
    }, [isAuthenticated, authLoading, user, navigate]); // Re-fetch when auth status or user changes

    if (authLoading || loading) {
         return (
        <div className="container">
            <div className="loading-message">Loading movie details...</div>
            <div className="loading-spinner"></div> {/* Optional spinner */}
        </div>
    );
    }

    if (error) {
        return <div className="container error-message">Error: {error}</div>;
    }

    return (
        <div className="container">
            <h2>My Favorite Movies</h2>
            {favoriteMovies.length === 0 ? (
                <p>You haven't added any favorite movies yet.</p>
            ) : (
                <div className="movie-grid"> {/* Apply your grid styling */}
                    {favoriteMovies.map(movie => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;