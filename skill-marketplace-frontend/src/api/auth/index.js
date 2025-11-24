import { get, post, put } from '../utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';
const API_URL = `${API_BASE_URL}/api`;

export const authAPI = {
  login: (credentials) => {
    return post('/auth/login', credentials);
  },

  register: (userData) => {
    return post('/auth/register', userData, true); // Pass true to indicate FormData
  },

  getProfile: () => {
    return get('/auth/profile');
  },

  updateProfile: (profileData) => {
    return put('/auth/profile', profileData, true); // Pass true to indicate FormData
  },

  getQuickStats: () => {
    return get('/auth/quick-stats');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return false;
      }

      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getStoredToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
