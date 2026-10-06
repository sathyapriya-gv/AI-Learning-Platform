import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Create axios instance with base URL configuration
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auraquiz_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Configure axios default header
        api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('auraquiz_user');
      }
    }
    setLoading(false);
  }, []);

  // Sync token to Axios whenever user state changes
  useEffect(() => {
    if (user && user.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data);
      localStorage.setItem('auraquiz_user', JSON.stringify(response.data));
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Register handler
  const register = async (username, email, password, role = 'student') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { username, email, password, role });
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data);
      localStorage.setItem('auraquiz_user', JSON.stringify(response.data));
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auraquiz_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
