import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.clear();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      setUser(data);
      toast.success(`Welcome back, ${data.firstname}!`);
      
      // Redirect based on role
      switch (data.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'organizer':
          navigate('/organizer');
          break;
        case 'player':
          navigate('/player');
          break;
        default:
          navigate('/');
      }
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate token on backend
      const token = localStorage.getItem('token');
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear all local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear session storage
      sessionStorage.clear();
      
      // Clear any cookies if used
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Clear user state
      setUser(null);
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to login page
      navigate('/login');
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      setUser(data);
      toast.success('Registration successful! Welcome aboard!');
      navigate('/player');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      toast.error('Failed to update profile');
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOrganizer: user?.role === 'organizer' || user?.role === 'admin',
    isPlayer: user?.role === 'player'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};