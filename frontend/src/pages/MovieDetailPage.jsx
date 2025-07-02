// frontend/src/pages/MovieDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function MovieDetailPage() {
  const { id } = useParams(); // Get movie ID from URL
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL; // For Vite
  const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/movies/${id}`);
        setMovie(response.data);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching movie details for ID ${id}:`, err);
        setError('Failed to load movie details. It might not exist or there was a server error.');
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]); // Re-run effect if ID changes

  if (loading) return <p>Loading movie details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!movie) return <p>Movie not found.</p>;

  const posterPath = movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', maxWidth: '900px', margin: '20px auto', border: '1px solid #eee', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <img
        src={posterPath}
        alt={movie.title}
        style={{ width: '300px', height: '450px', objectFit: 'cover', borderRadius: '8px' }}
      />
      <div>
        <h1>{movie.title} ({movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'})</h1>
        <p><strong>Tagline:</strong> {movie.tagline}</p>
        <p><strong>Overview:</strong> {movie.overview}</p>
        <p><strong>Rating:</strong> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} / 10 ({movie.vote_count} votes)</p>
        <p><strong>Genres:</strong> {movie.genres && movie.genres.map(g => g.name).join(', ')}</p>
        <p><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</p>
        <p><strong>Status:</strong> {movie.status}</p>
        {/* Add more details as needed */}
        {/* You can also add watch trailer button, add to watchlist, etc. */}
      </div>
    </div>
  );
}

export default MovieDetailPage;