'use client';
import axios from 'axios';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const gateway = axios.create({
  baseURL: `${GATEWAY_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

gateway.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

gateway.interceptors.response.use(
  (response) => response,
  (error) => {
    if ((error as any).response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
