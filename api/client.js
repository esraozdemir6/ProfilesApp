import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response => network error / timeout / DNS / blocked
    if (!error.response) {
      throw new Error('Network error. Check your connection.');
    }

    if (error.response.status === 404) {
      throw new Error('Resource not found');
    }

    if (error.response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    throw error;
  }
);
