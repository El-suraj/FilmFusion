import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from '../components/ReviewForm';
import { useToast}  from '../contexts/ToastContext.jsx';

const MovieDetailPage = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth(); // Ensure 'user' is destructured
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchMovieAndReviews = async () => {
            setLoading(true);
            setError(null);
            try {
                const movieResponse = await api.get(`/movies/${id}`);
                setMovie(movieResponse.data);

                const reviewsResponse = await api.get(`/reviews/movie/${id}`);
                // Ensure each review fetched initially has a user object for display,
                // even if the backend denormalizes it or only returns userId.
                const fetchedReviews = reviewsResponse.data.map(review => ({
                    ...review,
                    // Check if review.user is an object or just an ID string
                    user: (typeof review.user === 'object' && review.user !== null && review.user.username)
                          ? review.user
                          : (review.userId && user && review.userId === user._id) // If it's an ID, and it matches current user, use current user's data
                              ? { _id: user._id, username: user.username }
                              : { username: 'Anonymous' } // Fallback
                }));
                setReviews(fetchedReviews);

                if (isAuthenticated && user) {
                    try {
                        const userReviewResponse = await api.get(`/reviews/user/${id}`);
                        const fetchedUserReview = userReviewResponse.data;
                        setUserReview({
                            ...fetchedUserReview,
                            // Patch the user's own review if its 'user' field is just an ID
                            user: (typeof fetchedUserReview.user === 'object' && fetchedUserReview.user !== null && fetchedUserReview.user.username)
                                  ? fetchedUserReview.user
                                  : { _id: user._id, username: user.username } // Use current authenticated user's data
                        });
                    } catch (userReviewErr) {
                        if (userReviewErr.response && userReviewErr.response.status === 404) {
                            setUserReview(null);
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
        // This is the CRUCIAL PATCH for your "blank page" issue
        let patchedUserObject = null;
        if (typeof newOrUpdatedReview.user === 'object' && newOrUpdatedReview.user !== null && newOrUpdatedReview.user.username) {
            // Case 1: Backend returned a fully populated user object (ideal scenario)
            patchedUserObject = newOrUpdatedReview.user;
        } else if (user) {
            // Case 2: Backend returned just the userId string, but we have the authenticated user's data
            // We use the authenticated user's _id and username to construct the object
            patchedUserObject = { _id: user._id, username: user.username };
        } else {
            // Case 3: Fallback if no authenticated user info is available (shouldn't happen post-login)
            patchedUserObject = { username: 'Anonymous' };
        }

        const reviewToDisplay = {
            ...newOrUpdatedReview,
            user: patchedUserObject, // Assign the correctly formed user object
            // Keep direct username field as an additional fallback, though user.username should now be reliable
            username: newOrUpdatedReview.username || user?.username || 'Anonymous',
            createdAt: newOrUpdatedReview.createdAt || new Date().toISOString()
        };

        console.log("Review object after patching for display:", reviewToDisplay); // Keep this for debugging

        setReviews(prevReviews => {
            const existingIndex = prevReviews.findIndex(r => r._id === reviewToDisplay._id);
            if (existingIndex > -1) {
                // Update existing review in the list
                const updatedReviews = [...prevReviews];
                updatedReviews[existingIndex] = reviewToDisplay;
                return updatedReviews;
            } else {
                // Add new review to the top of the list
                return [reviewToDisplay, ...prevReviews];
            }
        });
        setUserReview(reviewToDisplay); // Update the user's specific review state
    };

    const handleReviewDeleted = (deletedReviewId) => {
        setReviews(prevReviews => prevReviews.filter(r => r._id !== deletedReviewId));
        setUserReview(null); // Clear the user's specific review state
    };


    if (loading) {
        return <div className="container">
            <div className="loading-message">Loading movie details...</div>
            <div className="loading-spinner"></div>
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

            <div className="reviews-section">
                <h3>Reviews</h3>
                <ReviewForm
                    movieId={parseInt(id)} // Ensure movieId is a number
                    movieTitle={movie?.title} // Pass movie title if your backend needs it for new reviews
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
                                {/* Ensure review.user and review.comment exist */}
                                <p>
                                    <strong>
                                        {review.user?.username || review.username || 'Anonymous'}
                                    </strong> - Rating: {review.rating}/10
                                </p>
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