// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../axiosConfig'; // Import the custom axios instance

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password }); // Use 'api' instance
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      return data; // Return user data on success
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred during login.";
      console.error("Login failed:", errorMessage);
      throw new Error(errorMessage); // Throw a new Error object with user-friendly message
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { username, email, password }); // Use 'api' instance
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred during registration.";
      console.error("Registration failed:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  // Optional: Function to load user details on app start if token is present but user state is not hydrated
  const loadUserFromToken = async () => {
    setLoading(true);
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser.token) {
        try {
          // You might have a /api/auth/me endpoint to verify the token and get fresh user data
          const { data } = await api.get('/auth/me'); // This route is protected
          setUser({ ...parsedUser, ...data }); // Update user state with fresh data
        } catch (error) {
          console.error("Failed to verify user token, logging out:", error.response?.data?.message || error.message);
          logout(); // Log out if token is invalid/expired
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserFromToken(); // Call this when component mounts
  }, []); // Empty dependency array means this runs once on mount

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {/* Only render children when authentication state has been loaded */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;