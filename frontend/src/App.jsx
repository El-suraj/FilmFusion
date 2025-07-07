// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// CORRECTED IMPORT: Import AuthProvider as default, useAuth as named
import AuthProvider, { useAuth } from './contexts/AuthContext'; // <--- Change this line
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import WatchlistsPage from './pages/WatchlistsPage'; // NEW: Import WatchlistsPage
import WatchlistDetailPage from './pages/WatchlistDetailPage'; // NEW: Import WatchlistDetailPage
import ProfilePage from './pages/ProfilePage'; // NEW: import profilePage 
import './app.css';


// PrivateRoute component to protect routes (no change here)
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading authentication...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/movies/:id" element={<MovieDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/movies/:id" element={<MovieDetailPage />} /> {/* Make sure this exists */}
                        <Route
                            path="/favorites"
                            element={
                                <PrivateRoute>
                                    <FavoritesPage />
                                </PrivateRoute>
                            }
                        />
                        {/* NEW: Protected Watchlists Routes */}
                        <Route
                            path="/watchlists"
                            element={
                                <PrivateRoute>
                                    <WatchlistsPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/watchlists/:id"
                            element={
                                <PrivateRoute>
                                    <WatchlistDetailPage />
                                </PrivateRoute>
                            }
                        />
                         <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <ProfilePage />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </main>
              
            </AuthProvider>
        </Router>
    );
}

export default App;