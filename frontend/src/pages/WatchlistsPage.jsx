import React, { useState, useEffect } from "react";
import api from "../axiosConfig";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import CreateWatchlistModal from "../components/CreateWatchlistModal"; // For creating new watchlists

const WatchlistsPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const fetchWatchlists = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/watchlists");
      setWatchlists(response.data);
    } catch (err) {
      console.error(
        "Error fetching watchlists:",
        err.response?.data?.message || err.message
      );
      setError(err.response?.data?.message || "Failed to fetch watchlists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isAuthenticated && !authLoading) {
      fetchWatchlists();
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const handleWatchlistCreated = (newWatchlist) => {
    setWatchlists((prev) => [newWatchlist, ...prev]); // Add new watchlist to state
    setShowCreateModal(false); // Close modal
    // Optionally, show a toast notification
  };

  const handleDeleteWatchlist = async (watchlistId) => {
    if (window.confirm("Are you sure you want to delete this watchlist?")) {
      try {
        await api.delete(`/watchlists/${watchlistId}`);
        setWatchlists((prev) => prev.filter((wl) => wl._id !== watchlistId));
        // Optionally, show a toast notification
      } catch (err) {
        console.error(
          "Error deleting watchlist:",
          err.response?.data?.message || err.message
        );
        alert(
          `Failed to delete watchlist: ${
            err.response?.data?.message || "Server error"
          }`
        );
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container">
        <div className="loading-message">Loading WatchLists...</div>
        <div className="loading-spinner"></div> {/* Optional spinner */}
      </div>
    );
  }

  if (error) {
    return <div className="container error-message">Error: {error}</div>;
  }

  return (
    <div className="container">
      <h2>My Watchlists</h2>
      <button
        onClick={() => setShowCreateModal(true)}
        className="btn create-watchlist-btn"
      >
        Create New Watchlist
      </button>

      {showCreateModal && (
        <CreateWatchlistModal
          onClose={() => setShowCreateModal(false)}
          onWatchlistCreated={handleWatchlistCreated}
        />
      )}

      {watchlists.length === 0 ? (
        <p>You haven't created any watchlists yet.</p>
      ) : (
        <div className="watchlist-list">
          {watchlists.map((watchlist) => (
            <div key={watchlist._id} className="watchlist-item">
              <h3>
                <Link to={`/watchlists/${watchlist._id}`}>
                  {watchlist.name}
                </Link>
              </h3>
              <p>{watchlist.description}</p>
              <p>Movies: {watchlist.movies.length}</p>
              <button
                onClick={() => handleDeleteWatchlist(watchlist._id)}
                className="btn delete-btn"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistsPage;
