import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
  withCredentials: true, // Important for sending/receiving httpOnly cookies
});

// Request interceptor to attach access token if we have it in memory
// Note: In this architecture, we keep the access token in memory or a context state,
// but to make it available to axios easily without cyclic dependencies, we can inject it
// or let the AuthContext set it on the axios instance.
// For now, we'll expose a function to set the token.
let currentAccessToken = null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and token refresh
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't intercept refresh token failures to avoid infinite loops
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post('/auth/refresh');
        const newAccessToken = data.data.accessToken;
        
        setAccessToken(newAccessToken);
        isRefreshing = false;
        onRefreshed(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        setAccessToken(null);
        // Dispatch a custom event to tell the app to log out
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    // Format the error nicely for components
    const appError = new Error(error.response?.data?.error?.message || 'An unexpected error occurred');
    appError.code = error.response?.data?.error?.code;
    appError.details = error.response?.data?.error?.details;
    appError.status = error.response?.status;
    
    return Promise.reject(appError);
  }
);

export default axiosInstance;
