// frontend/src/contexts/AuthContext.js
    import React, { createContext, useState, useEffect, useContext } from 'react';
    import axios from 'axios'; // Or your configured axios instance

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
          const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, { email, password });
          localStorage.setItem('userInfo', JSON.stringify(data));
          setUser(data);
          return data; // Return user data on success
        } catch (error) {
          console.error("Login failed:", error.response?.data?.message || error.message);
          throw error; // Re-throw to be handled by UI
        }
      };

      const register = async (username, email, password) => {
        try {
          const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/register`, { username, email, password });
          localStorage.setItem('userInfo', JSON.stringify(data));
          setUser(data);
          return data;
        } catch (error) {
          console.error("Registration failed:", error.response?.data?.message || error.message);
          throw error;
        }
      };

      const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
      };

      return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
          {!loading && children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => useContext(AuthContext);

    
    export default AuthProvider;
