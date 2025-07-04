import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login'); // Redirect if not authenticated
            return;
        }

        const fetchUserProfile = async () => {
            if (!user) { // Wait for user to be loaded from AuthContext
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get('/users/profile');
                setUsername(data.username);
                setEmail(data.email);
            } catch (err) {
                console.error('Error fetching profile:', err.response?.data?.message || err.message);
                setError(err.response?.data?.message || 'Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && !authLoading) {
            fetchUserProfile();
        }
    }, [isAuthenticated, authLoading, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (password && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const updateData = { username, email };
            if (password) {
                updateData.password = password;
            }

            const { data } = await api.put('/users/profile', updateData);
            setSuccessMessage('Profile updated successfully!');
            setPassword(''); // Clear password fields after successful update
            setConfirmPassword('');
            // If username or email changed, you might need to re-log in or update AuthContext's user state
            // For simplicity, we just show success. A full re-login might be needed for token updates.
            // The `AuthContext` needs to be updated if the `user` object in it is showing stale data.
            // For now, it will show the original unless a full refresh happens or you explicitly update `user` state in AuthContext.
        } catch (err) {
            console.error('Error updating profile:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div className="container">
            <div className="loading-message">Loading Profile...</div>
            <div className="loading-spinner"></div> {/* Optional spinner */}
        </div>
    }

    if (error && !user) { // Only show global error if user isn't loaded (e.g., initial fetch failed)
        return <div className="container error-message">Error: {error}</div>;
    }

    return (
        <div className="container profile-page">
            <h2>User Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">New Password (optional):</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;