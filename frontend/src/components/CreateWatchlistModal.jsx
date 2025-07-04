import React, { useState } from 'react';
import api from '../axiosConfig'; // Your configured axios instance

const CreateWatchlistModal = ({ onClose, onWatchlistCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { data } = await api.post('/watchlists', { name, description, isPublic });
            onWatchlistCreated(data); // Callback to update parent state or re-fetch
            onClose(); // Close the modal on success
        } catch (err) {
            console.error('Error creating watchlist:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to create watchlist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop"> {/* Basic modal styling */}
            <div className="modal-content">
                <h3>Create New Watchlist</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description (Optional):</label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="form-group checkbox-group">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        <label htmlFor="isPublic">Make Public</label>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Watchlist'}
                        </button>
                        <button type="button" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWatchlistModal;