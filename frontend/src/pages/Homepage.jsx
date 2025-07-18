import React, { useState, useEffect, useCallback } from 'react'; // NEW: Add useCallback
import api from '../axiosConfig';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination'; // NEW: Import Pagination component
import { useSearchParams, useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); // NEW: State for current page
    const [totalPages, setTotalPages] = useState(1); // NEW: State for total pages

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const urlSearchQuery = searchParams.get('query'); // This is the query from the URL
    const urlPage = parseInt(searchParams.get('page')) || 1; // NEW: Get page from URL
    const [localSearchQuery, setLocalSearchQuery] = useState(urlSearchQuery || '');

    // Use useCallback to memoize fetchMovies, preventing re-creation on every render
    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let endpoint = '/movies/popular';
            let title = 'Popular Movies';

            if (urlSearchQuery) {
                endpoint = `/movies/search?query=${urlSearchQuery}&page=${urlPage}`;
                title = `Search Results for "${urlSearchQuery}"`;
            } else {
                endpoint = `/movies/popular?page=${urlPage}`;
            }

            const { data } = await api.get(endpoint);
            setMovies(data.results); // Now accessing 'results' property
            setCurrentPage(data.page); // Update current page from API response
            setTotalPages(data.total_pages); // Update total pages from API response
            document.title = title;
        } catch (err) {
            console.error('Error fetching movies:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to fetch movies.');
        } finally {
            setLoading(false);
        }
    }, [urlSearchQuery, urlPage]); // Dependencies for useCallback

    useEffect(() => {
        fetchMovies();
        setLocalSearchQuery(urlSearchQuery || ''); // Keep local search input in sync
    }, [fetchMovies, urlSearchQuery, urlPage]); // Dependencies for useEffect

    const handleLocalSearch = (e) => {
        e.preventDefault();
        const newQuery = localSearchQuery.trim();
        if (newQuery) {
            // When searching, reset to page 1
            navigate(`/?query=${encodeURIComponent(newQuery)}&page=1`);
        } else {
            // Go back to popular movies, reset to page 1
            navigate(`/?page=1`);
        }
    };

    // NEW: Handle page change
    const handlePageChange = (page) => {
        // Construct the new URL with updated page and existing search query
        const currentPath = urlSearchQuery
            ? `/?query=${encodeURIComponent(urlSearchQuery)}&page=${page}`
            : `/?page=${page}`;
        navigate(currentPath);
    };


    if (loading) {
        return (
            <div className="container">
                <div className="loading-message">Loading movies...</div>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return <div className="container error-message">{error}</div>;
    }

    return (
        <div className="container">
            <form onSubmit={handleLocalSearch} className="home-search-form">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-button">Search</button>
            </form>

            <h2>
                {urlSearchQuery ? `Search Results for "${urlSearchQuery}"` : 'Popular Movies'}
            </h2>
            {movies.length === 0 && !loading && (urlSearchQuery ?
                <p>No movies found for "{urlSearchQuery}".</p> :
                <p>No popular movies found.</p>
            )}

            <div className="movie-grid">
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>

            {/* NEW: Pagination Controls */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default HomePage;