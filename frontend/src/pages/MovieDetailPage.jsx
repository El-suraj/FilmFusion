// frontend/src/pages/MovieDetailPage.jsx (Illustrative changes)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../axiosConfig'; // Your configured axios instance
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from '../components/ReviewForm'; // NEW: Import ReviewForm
import { useToast } from '../contexts/ToastContext'; 

const MovieDetailPage = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth(); // Get user for review ownership check
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]); // State for all reviews of this movie
    const [userReview, setUserReview] = useState(null); // State for the current user's review
    const { showToast } = useToast();

    useEffect(() => {
        const fetchMovieAndReviews = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch movie details
                const movieResponse = await api.get(`/movies/${id}`);
                setMovie(movieResponse.data);

                // Fetch all reviews for this movie
                const reviewsResponse = await api.get(`/reviews/movie/${id}`);
                setReviews(reviewsResponse.data);

                // If authenticated, try to fetch the current user's review
                if (isAuthenticated && user) {
                    try {
                        const userReviewResponse = await api.get(`/reviews/user/${id}`);
                        setUserReview(userReviewResponse.data);
                    } catch (userReviewErr) {
                        if (userReviewErr.response && userReviewErr.response.status === 404) {
                            setUserReview(null); // No review found for this user
                        } else {
                            console.error("Error fetching user's review:", userReviewErr);
                        }
                    }
                } else {
                    setUserReview(null);
                }

            } catch (err) {
                console.error('Error fetching movie or reviews:', err.response?.data?.message || err.message);
                setError(err.response?.data?.message || 'Failed to fetch movie details or reviews.');
            } finally {
                setLoading(false);
            }
        };

        fetchMovieAndReviews();
    }, [id, isAuthenticated, user]); // Re-fetch if movie ID, auth status, or user changes

    const handleReviewSubmitted = (newOrUpdatedReview) => {
        // Update the list of all reviews
        setReviews(prevReviews => {
            const existingIndex = prevReviews.findIndex(r => r._id === newOrUpdatedReview._id);
            if (existingIndex > -1) {
                // Update existing review in the list
                const updatedReviews = [...prevReviews];
                updatedReviews[existingIndex] = newOrUpdatedReview;
                return updatedReviews;
            } else {
                // Add new review to the top of the list
                return [newOrUpdatedReview, ...prevReviews];
            }
        });
        setUserReview(newOrUpdatedReview); // Update the user's specific review state
    };

    const handleReviewDeleted = (deletedReviewId) => {
        setReviews(prevReviews => prevReviews.filter(r => r._id !== deletedReviewId));
        setUserReview(null); // Clear the user's specific review state
    };


    if (loading) {
        return <div className="container">
            <div className="loading-message">Loading movie details...</div>
            <div className="loading-spinner"></div> {/* Optional spinner */}
        </div>
    }

    if (error) {
        return <div className="container error-message">Error: {error}</div>;
    }

    if (!movie) {
        return <div className="container">Movie not found.</div>;
    }

    return (
        <div className="container movie-detail-page">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="movie-poster" />
            <h1>{movie.title}</h1>
            <p><strong>Release Date:</strong> {movie.release_date}</p>
            <p><strong>Overview:</strong> {movie.overview}</p>
            <p><strong>Popularity : </strong>{movie.popularity}</p>
            <p><strong>Average Rating:</strong> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p>
            {/* Add favorite/watchlist buttons here if not already on MovieCard */}

            {/* Review Section */}
            <div className="reviews-section">
                <h3>Reviews</h3>
                <ReviewForm
                    movieId={parseInt(id)} // Ensure movieId is a number
                    currentReview={userReview}
                    onReviewSubmitted={handleReviewSubmitted}
                    onReviewDeleted={handleReviewDeleted}
                />

                {reviews.length === 0 ? (
                    <p>No reviews yet for this movie.</p>
                ) : (
                    <div className="reviews-list">
                        {reviews.map((review) => (
                            <div key={review._id} className="review-item">
                                <p><strong>{review.user?.username || 'Anonymous'}</strong> - Rating: {review.rating}/10</p>
                                <p>{review.comment}</p>
                                <p className="review-date">Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieDetailPage;