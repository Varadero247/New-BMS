'use client';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api/health-safety`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// CSRF token management
let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  const res = await axios.get(`${API_URL}/api/v1/csrf-token`, { withCredentials: true });
  csrfToken = res.data.data.csrfToken;
  return csrfToken!;
}

const PROTECTED_METHODS = ['post', 'put', 'patch', 'delete'];

// Add auth token and CSRF token to requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    if (PROTECTED_METHODS.includes(config.method || '')) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth and CSRF errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Retry once on CSRF token errors
    if (error.response?.status === 403 && error.response?.data?.error?.code?.startsWith('CSRF_TOKEN') && !error.config._csrfRetry) {
      error.config._csrfRetry = true;
      await fetchCsrfToken();
      error.config.headers['X-CSRF-Token'] = csrfToken;
      return api.request(error.config);
    }

    return Promise.reject(error);
  }
);
