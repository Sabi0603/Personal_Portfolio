import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Consistent data unwrapping and safe 401 handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status || 500;
    const url = error.config?.url || '';

    // Exclude public/auth credential-check endpoints from automatic redirect
    const isAuthFormEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password');

    if (status === 401 && !isAuthFormEndpoint) {
      localStorage.removeItem('admin_token');
      if (
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/admin') &&
        !window.location.pathname.startsWith('/admin/login') &&
        !window.location.pathname.startsWith('/admin/forgot-password') &&
        !window.location.pathname.startsWith('/admin/reset-password')
      ) {
        window.location.href = '/admin/login';
      }
    }

    const isTimeout = error.code === 'ECONNABORTED' || (typeof error.message === 'string' && error.message.toLowerCase().includes('timeout'));
    const customError = {
      message:
        error.response?.data?.message ||
        (isTimeout
          ? 'The request took too long to complete. Please check your connection and try again.'
          : error.message || 'An unexpected error occurred'),
      status,
      errors: error.response?.data?.errors || null,
    };
    return Promise.reject(customError);
  }
);

export const checkHealth = async () => {
  return await api.get('/health');
};

export default api;
