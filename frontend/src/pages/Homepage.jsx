// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard.jsx'; // Make sure to use .jsx
import { useAuth } from '../contexts/AuthContext.jsx'; // Use .jsx

function HomePage() {
  const { user } = useAuth(); // Access user from context
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL; // For Vite

  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/movies/popular`);
        setMovies(response.data.results);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching popular movies:', err);
        setError('Failed to load popular movies. Please try again later.');
        setLoading(false);
      }
    };

    fetchPopularMovies();
  }, []); // Empty dependency array means this runs once on component mount

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/movies/search`, {
        params: { query: searchQuery }
      });
      setSearchResults(response.data.results);
      setLoading(false);
    } catch (err) {
      console.error('Error searching movies:', err);
      setError('Failed to search movies. Please try again.');
      setLoading(false);
    }
  };

  if (loading)  return (
        <div className="container">
            <div className="loading-message">Loading movies...</div>
            <div className="loading-spinner"></div> {/* Optional spinner */}
        </div>
    );
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  const displayMovies = searchResults.length > 0 ? searchResults : movies;

  return (
    <div>
      <h1>Welcome to Film Fusion ! ! !</h1>
      {user ? (
        <p>Hello, {user.username}! Discover, save, and rate your favorite movies.</p>
      ) : (
        <p>Discover, save, and rate your favorite movies. <a href="/login">Login</a> or <a href="/register">Register</a> to get started!</p>
      )}

      <h2>Search Movies</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 15px' }}>Search</button>
      </form>

      <h2>{searchResults.length > 0 ? 'Search Results' : 'Popular Movies'}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {displayMovies.length > 0 ? (
          displayMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        ) : (
          <p>{searchResults.length === 0 && searchQuery ? 'No search results found.' : 'No popular movies to display.'}</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;