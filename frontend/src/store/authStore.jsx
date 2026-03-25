import { create } from 'zustand';
import API from '../services/api.jsx';

// Helper — decode JWT and check if it's expired
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Helper — load initial state from localStorage only if token is still valid
const loadInitialState = () => {
  try {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user && isTokenValid(token)) {
      return { token, user };
    }

    // Token expired or missing — clear everything
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  }
};

const initialState = loadInitialState();

const useAuthStore = create((set, get) => ({
  user:      initialState.user,
  token:     initialState.token,
  isLoading: false,
  error:     null,

  // Check if current session is still valid
  isAuthenticated: () => {
    const { token } = get();
    return !!token && isTokenValid(token);
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    // Clear all auth-related keys from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Reset store completely
    set({ user: null, token: null, error: null, isLoading: false });
  },

  // Called by API interceptor on 401
  forceLogout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
