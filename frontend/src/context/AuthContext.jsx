import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // if token exists from previous session, set header
    const savedToken = localStorage.getItem('token');
    if (savedToken) axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        withCredentials: true
      });
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        '/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data.user);
      if (response.data.token) {
        const token = response.data.token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(
        '/api/auth/register',
        { name, email, password },
        { withCredentials: true }
      );
      setUser(response.data.user);
      if (response.data.token) {
        const token = response.data.token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
