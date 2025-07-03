// frontend/src/App.jsx (Illustrative changes)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import AuthProvider and useAuth
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage'; // Import FavoritesPage

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading authentication...</div>; // Or a spinner
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider> {/* Wrap your entire app with AuthProvider */}
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/movies/:id" element={<MovieDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        {/* Protected Favorites Route */}
                        <Route
                            path="/favorites"
                            element={
                                <PrivateRoute>
                                    <FavoritesPage />
                                </PrivateRoute>
                            }
                        />
                        {/* Add other routes as needed */}
                    </Routes>
                </main>
            </AuthProvider>
        </Router>
    );
}

export default App;