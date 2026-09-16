import axiosInstance from './axiosInstance';

export const jobApi = {
  getJobs: async (params) => {
    const cleanedParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v != null && v !== '')
    );
    const response = await axiosInstance.get('/jobs', { params: cleanedParams });
    return response.data;
  },

  getFreshJobs: async (params) => {
    const cleanedParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v != null && v !== '')
    );
    // Fresh jobs = last 24h by default
    const response = await axiosInstance.get('/jobs', {
      params: { postedWithin: '24h', ...cleanedParams },
    });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await axiosInstance.get(`/jobs/${id}`);
    return response.data;
  },

  getJobMatchScore: async (id) => {
    const response = await axiosInstance.get(`/jobs/${id}/match`);
    return response.data;
  },

  getRecommendedJobs: async () => {
    const response = await axiosInstance.get('/jobs/recommended');
    return response.data;
  },
};
