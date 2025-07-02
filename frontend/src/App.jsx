import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MovieDetailPage from "./pages/MovieDetailPage.jsx";
// import WatchlistPage from "./pages/WatchlistPage";
// import ProfilePage from "./pages/ProfilePage";
import AuthProvider from "./contexts/AuthContext.jsx"; // Context for authentication
import PrivateRoute from "./components/PrivateRoute.jsx"; // For protected routes

function App() {
  return (
    <Router>
      <AuthProvider>
        {" "}
        {/* Wrap app with AuthProvider */}
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            {/* Protected Routes */}
            <Route
              path="/watchlists"
              element={
                <PrivateRoute>
                  {/* <WatchlistPage /> */}
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  {/* <ProfilePage /> */}
                </PrivateRoute>
              }
            />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;
