import axiosInstance from './axiosInstance';

export const authApi = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  refresh: async () => {
    const response = await axiosInstance.post('/auth/refresh');
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosInstance.patch('/users/me', data);
    return response.data;
  },

  completeOnboarding: async (data) => {
    const response = await axiosInstance.patch('/users/me/onboarding', data);
    return response.data;
  },
};
