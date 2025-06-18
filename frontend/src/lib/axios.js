// frontend/src/lib/axios.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api`;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response && error.response.status === 401 && error.config.url.endsWith('/check-auth')) {
      return Promise.resolve({
        data: {
          isAuthenticated: false,
          role: null,
          message: "Authentication check: No valid token found.",
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
        request: error.request
      });
    }
    return Promise.reject(error);
  }
);
