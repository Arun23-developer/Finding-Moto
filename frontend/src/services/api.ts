import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = (() => {
  const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();

  // In local development, prefer the backend directly when the env value is
  // left as a relative /api path. This avoids proxy-specific failures while
  // keeping explicit absolute URLs intact.
  if (import.meta.env.DEV) {
    if (!configuredApiUrl || configuredApiUrl === '/api' || configuredApiUrl.startsWith('/')) {
      return 'http://localhost:5000/api';
    }
  }

  if (configuredApiUrl) return configuredApiUrl;
  return '/api';
})();

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (config.data instanceof FormData && config.headers) {
      // Let browser/axios set multipart boundary automatically for file uploads.
      delete config.headers['Content-Type'];
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if we were on a protected route (not /public/)
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isPublicRoute = url.includes('/public/');
      if (!isPublicRoute) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
