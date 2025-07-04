import React, { useState, useEffect } from 'react';
import api from '../axiosConfig'; // Your configured axios instance
import { useAuth } from '../contexts/AuthContext';

const ReviewForm = ({ movieId, currentReview, onReviewSubmitted, onReviewDeleted }) => {
    const { isAuthenticated } = useAuth();
    const [rating, setRating] = useState(currentReview?.rating || '');
    const [comment, setComment] = useState(currentReview?.comment || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Update form fields if currentReview changes (e.g., when editing)
    useEffect(() => {
        setRating(currentReview?.rating || '');
        setComment(currentReview?.comment || '');
    }, [currentReview]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        if (!isAuthenticated) {
            setError('You must be logged in to submit a review.');
            setLoading(false);
            return;
        }

        if (!rating || !comment) {
            setError('Please provide both a rating and a comment.');
            setLoading(false);
            return;
        }

        try {
            let response;
            if (currentReview) {
                // Update existing review
                response = await api.put(`/reviews/${currentReview._id}`, { rating, comment });
                setSuccessMessage('Review updated successfully!');
            } else {
                // Create new review
                response = await api.post('/reviews', { movieId, rating, comment });
                setSuccessMessage('Review submitted successfully!');
            }
            onReviewSubmitted(response.data); // Pass the new/updated review to parent
            setRating(''); // Clear form after submission
            setComment('');
            setError(null);
        } catch (err) {
            console.error('Review submission error:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isAuthenticated) {
            alert('You must be logged in to delete a review.');
            return;
        }
        if (!currentReview || !window.confirm('Are you sure you want to delete your review?')) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await api.delete(`/reviews/${currentReview._id}`);
            onReviewDeleted(currentReview._id); // Notify parent review was deleted
            setSuccessMessage('Review deleted successfully!');
            setRating(''); // Clear form
            setComment('');
        } catch (err) {
            console.error('Review deletion error:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to delete review.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return <p className="info-message">Please log in to leave a review.</p>;
    }

    return (
        <div className="review-form">
            <h4>{currentReview ? 'Edit Your Review' : 'Leave a Review'}</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="rating">Rating (1-10):</label>
                    <input
                        type="number"
                        id="rating"
                        min="1"
                        max="10"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="comment">Comment:</label>
                    <textarea
                        id="comment"
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        disabled={loading}
                    ></textarea>
                </div>
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : (currentReview ? 'Update Review' : 'Submit Review')}
                </button>
                {currentReview && ( // Show delete button only if editing an existing review
                    <button type="button" onClick={handleDelete} disabled={loading} className="btn-danger">
                        Delete Review
                    </button>
                )}
            </form>
        </div>
    );
};

export default ReviewForm;