import React, { useState, useEffect, useCallback } from 'react';
import api from '../axiosConfig';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext'; // Ensure useToast is imported

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [genres, setGenres] = useState([]); // NEW: State for genres
    const [selectedGenre, setSelectedGenre] = useState(''); // NEW: State for selected genre
    const [sortBy, setSortBy] = useState('popularity.desc'); // NEW: State for sorting

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const urlSearchQuery = searchParams.get('query');
    const urlPage = parseInt(searchParams.get('page')) || 1;
    const urlGenre = searchParams.get('genre') || ''; // NEW: Get genre from URL
    const urlSortBy = searchParams.get('sort_by') || 'popularity.desc'; // NEW: Get sort_by from URL

    const [localSearchQuery, setLocalSearchQuery] = useState(urlSearchQuery || '');

    // Effect to fetch genres once on component mount
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const { data } = await api.get('/movies/genres');
                setGenres(data);
            } catch (err) {
                console.error('Error fetching genres:', err);
                showToast('Failed to load genres.', 'error');
            }
        };
        fetchGenres();
    }, [showToast]);

    // Effect to update local state from URL params
    useEffect(() => {
        setLocalSearchQuery(urlSearchQuery || '');
        setCurrentPage(urlPage);
        setSelectedGenre(urlGenre); // Sync selected genre with URL
        setSortBy(urlSortBy); // Sync sort_by with URL
    }, [urlSearchQuery, urlPage, urlGenre, urlSortBy]);


    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let endpoint = '/movies/popular';
            let title = 'Popular Movies';
            const params = { page: urlPage };

            if (urlSearchQuery) {
                endpoint = `/movies/search`;
                title = `Search Results for "${urlSearchQuery}"`;
                params.query = urlSearchQuery;
            } else {
                // Apply genre and sort_by only for popular/discover endpoint
                if (urlGenre) {
                    params.genre = urlGenre;
                    const genreName = genres.find(g => g.id === parseInt(urlGenre))?.name;
                    title = `${genreName ? genreName + ' ' : ''}Movies`;
                }
                if (urlSortBy) {
                    params.sort_by = urlSortBy;
                    // You can refine title based on sort_by if you want
                }
            }

            const { data } = await api.get(endpoint, { params });

            setMovies(data.results);
            setTotalPages(data.total_pages);
            document.title = title;
        } catch (err) {
            console.error('Error fetching movies:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to fetch movies.');
            showToast('Failed to fetch movies.', 'error'); // Toast for fetch errors
        } finally {
            setLoading(false);
        }
    }, [urlSearchQuery, urlPage, urlGenre, urlSortBy, genres, showToast]); // Add genres to dependencies

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]); // Dependency on fetchMovies useCallback

    const handleLocalSearch = (e) => {
        e.preventDefault();
        const newQuery = localSearchQuery.trim();
        const newSearchParams = new URLSearchParams();
        if (newQuery) {
            newSearchParams.set('query', encodeURIComponent(newQuery));
        }
        newSearchParams.set('page', '1'); // Always reset to page 1 on new search
        // Preserve genre/sort_by if they were set and not searching
        if (!newQuery && selectedGenre) newSearchParams.set('genre', selectedGenre);
        if (!newQuery && sortBy) newSearchParams.set('sort_by', sortBy);

        navigate(`/?${newSearchParams.toString()}`);
    };

    const handleFilterChange = (e) => {
        const newGenre = e.target.value;
        setSelectedGenre(newGenre);
        const newSearchParams = new URLSearchParams();
        if (newGenre) newSearchParams.set('genre', newGenre);
        newSearchParams.set('page', '1'); // Reset to page 1 on genre change
        // Preserve sort_by
        if (sortBy) newSearchParams.set('sort_by', sortBy);
        navigate(`/?${newSearchParams.toString()}`);
    };

    const handleSortChange = (e) => {
        const newSortBy = e.target.value;
        setSortBy(newSortBy);
        const newSearchParams = new URLSearchParams();
        if (newSortBy) newSearchParams.set('sort_by', newSortBy);
        newSearchParams.set('page', '1'); // Reset to page 1 on sort change
        // Preserve genre
        if (selectedGenre) newSearchParams.set('genre', selectedGenre);
        navigate(`/?${newSearchParams.toString()}`);
    };

    const handlePageChange = (page) => {
        const newSearchParams = new URLSearchParams();
        if (urlSearchQuery) newSearchParams.set('query', urlSearchQuery);
        if (urlGenre) newSearchParams.set('genre', urlGenre);
        if (urlSortBy) newSearchParams.set('sort_by', urlSortBy);
        newSearchParams.set('page', page.toString());
        navigate(`/?${newSearchParams.toString()}`);
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

            <div className="filter-sort-controls"> {/* NEW: Container for filters/sort */}
                <div className="filter-group">
                    <label htmlFor="genre-select">Genre:</label>
                    <select id="genre-select" value={selectedGenre} onChange={handleFilterChange}>
                        <option value="">All Genres</option>
                        {genres.map(genre => (
                            <option key={genre.id} value={genre.id}>{genre.name}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="sort-select">Sort By:</label>
                    <select id="sort-select" value={sortBy} onChange={handleSortChange}>
                        <option value="popularity.desc">Popularity (Desc)</option>
                        <option value="popularity.asc">Popularity (Asc)</option>
                        <option value="vote_average.desc">Rating (Desc)</option>
                        <option value="vote_average.asc">Rating (Asc)</option>
                        <option value="release_date.desc">Release Date (Newest)</option>
                        <option value="release_date.asc">Release Date (Oldest)</option>
                    </select>
                </div>
            </div>

            <h2>
                {urlSearchQuery ? `Search Results for "${urlSearchQuery}"` : 'Popular Movies'}
            </h2>
            {movies.length === 0 && !loading && (urlSearchQuery ?
                <p>No movies found for "{urlSearchQuery}".</p> :
                <p>No movies found with current filters.</p> // Updated message for filters
            )}

            <div className="movie-grid">
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>

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