import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have AuthContext

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Get user and loading state from AuthContext

  if (loading) {
    return <div>Loading authentication... </div>; // Or a proper loading spinner
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
