import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import '../app.css';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        background: "rgb(4, 21, 37)",
        padding: "10px 20px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius:"10px",
        justifySelf: "center",
        width: "115rem",
        height: "3.5em",
      }}
      className="navbar"
    >
      
      <Link
        to="/"
        style={{ color: "white", textDecoration: "none", fontSize: "1.5em" }}
      >
        <button className="btn">Film Fusion</button>
      </Link>
      <div className="navbar-nav">
        <Link
          to="/"
          
          /*style={{ /*color: "#c53d3d", textDecoration: "none", marginLeft: "15px", fontSize:"1.2em" }}*/
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
                fontSize:"1.2em"
              }}
            >
              Watchlists
            </Link>
            <Link
              to="/favorites"
              style={{
                color: "#e42759",
                textDecoration: "none",
                marginLeft: "15px",
                fontSize:"1.2em"
              }}
            >
              Favorites
            </Link>
            <Link
              to="/profile"
              style={{
                color: "#e42759",
                textDecoration: "none",
                marginLeft: "15px",
                fontSize:"1.2em"
              }}
            >
              Profile
            </Link>
            <span style={{ marginLeft: "15px",fontSize:"1.2em"}}>
              Welcome, {user.username}!
            </span>
            <button
              onClick={logout}
              style={{
                marginLeft: "15px",
                background: "none",
                border: "1px solid white",
                color: "#e42759",
                padding: "5px 10px",
                cursor: "pointer",
                fontSize:"1.2em"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              // style={{
              //   /*color: "#e42759",*/
              //   textDecoration: "none",
              //   marginLeft: "15px",
              //   fontSize:"1.2em"
              // }}
            >
              Login
            </Link>
            <Link
              to="/register"
              
              // style={{
              //   /*color: "#e42759",*/
              //   textDecoration: "none",
              //   marginLeft: "20px",
              //   fontSize:"1.2em"
              // }}
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
