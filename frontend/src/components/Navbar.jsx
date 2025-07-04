import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        background: "#333",
        padding: "10px 20px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        to="/"
        style={{ color: "white", textDecoration: "none", fontSize: "1.5em" }}
      >
        MovieApp
      </Link>
      <div>
        <Link
          to="/"
          style={{ color: "white", textDecoration: "none", marginLeft: "15px" }}
        >
          Home
        </Link>
        {user ? (
          <>
            <Link
              to="/watchlists"
              style={{
                color: "white",
                textDecoration: "none",
                marginLeft: "15px",
              }}
            >
              Watchlists
            </Link>
            <Link
              to="/favorites"
              style={{
                color: "white",
                textDecoration: "none",
                marginLeft: "15px",
              }}
            >
             Favorites
            </Link>
            <Link
              to="/profile"
              style={{
                color: "white",
                textDecoration: "none",
                marginLeft: "15px",
              }}
            >
              Profile
            </Link>
            <span style={{ marginLeft: "15px" }}>
              Welcome, {user.username}!
            </span>
            <button
              onClick={logout}
              style={{
                marginLeft: "15px",
                background: "none",
                border: "1px solid white",
                color: "white",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                color: "white",
                textDecoration: "none",
                marginLeft: "15px",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{
                color: "white",
                textDecoration: "none",
                marginLeft: "15px",
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
