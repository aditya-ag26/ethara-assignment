import axios from 'axios';

// In dev mode, Vite proxy handles /products, /customers, /orders -> localhost:8000
// In production (Docker/nginx), nginx proxy handles the same
// Only use VITE_API_URL if explicitly set for standalone deployment
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
