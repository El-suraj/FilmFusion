// frontend/src/components/MovieCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function MovieCard({ movie }) {
  const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w200';
  const posterPath = movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image';

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '10px',
      margin: '10px',
      width: '220px',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img
          src={posterPath}
          alt={movie.title}
          style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '4px' }}
        />
        <h3 style={{ fontSize: '1.1em', margin: '10px 0' }}>{movie.title}</h3>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          Release: {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
        </p>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          Rating: {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
        </p>
      </Link>
      {/* Add buttons for favorite/watchlist here later */}
    </div>
  );
}

export default MovieCard;