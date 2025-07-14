import React, { useState, useEffect } from 'react';
import api from '../axiosConfig'; // Your configured axios instance
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext'; // NEW: Import useToast

const ReviewForm = ({ movieId, currentReview, onReviewSubmitted, onReviewDeleted }) => {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast(); // NEW: Access showToast from context

    const [rating, setRating] = useState(currentReview?.rating || '');
    const [comment, setComment] = useState(currentReview?.comment || '');
    const [loading, setLoading] = useState(false);
    // REMOVED: [error, setError] = useState(null);
    // REMOVED: [successMessage, setSuccessMessage] = useState(null);

    // Update form fields if currentReview changes (e.g., when editing)
    useEffect(() => {
        setRating(currentReview?.rating || '');
        setComment(currentReview?.comment || '');
    }, [currentReview]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // REMOVED: setError(null);
        // REMOVED: setSuccessMessage(null);
        setLoading(true);

        if (!isAuthenticated) {
            showToast('You must be logged in to submit a review.', 'info'); // NEW: Toast notification
            setLoading(false);
            return;
        }

        if (!rating || !comment) {
            showToast('Please provide both a rating and a comment.', 'warning'); // NEW: Toast notification
            setLoading(false);
            return;
        }

        try {
            let response;
            if (currentReview) {
                // Update existing review
                response = await api.put(`/reviews/${currentReview._id}`, { rating, comment });
                showToast('Review updated successfully!', 'success'); // NEW: Toast notification
            } else {
                // Create new review
                response = await api.post('/reviews', { movieId, rating, comment });
                showToast('Review submitted successfully!', 'success'); // NEW: Toast notification
            }
            onReviewSubmitted(response.data); // Pass the new/updated review to parent
            setRating(''); // Clear form after submission
            setComment('');
            // REMOVED: setError(null);
        } catch (err) {
            console.error('Review submission error:', err.response?.data?.message || err.message);
            showToast(err.response?.data?.message || 'Failed to submit review.', 'error'); // NEW: Toast notification
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isAuthenticated) {
            showToast('You must be logged in to delete a review.', 'info'); // NEW: Toast notification
            return;
        }
        if (!currentReview || !window.confirm('Are you sure you want to delete your review?')) {
            return;
        }

        setLoading(true);
        // REMOVED: setError(null);
        // REMOVED: setSuccessMessage(null);

        try {
            await api.delete(`/reviews/${currentReview._id}`);
            onReviewDeleted(currentReview._id); // Notify parent review was deleted
            showToast('Review deleted successfully!', 'info'); // NEW: Toast notification
            setRating(''); // Clear form
            setComment('');
        } catch (err) {
            console.error('Review deletion error:', err.response?.data?.message || err.message);
            showToast(err.response?.data?.message || 'Failed to delete review.', 'error'); // NEW: Toast notification
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
                {/* REMOVED: {error && <p className="error-message">{error}</p>} */}
                {/* REMOVED: {successMessage && <p className="success-message">{successMessage}</p>} */}
                <button type="submit" disabled={loading} className="btn-update">
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