import axiosInstance from './axiosInstance';

export const applicationApi = {
  getApplications: async () => {
    const response = await axiosInstance.get('/applications');
    return response.data;
  },

  saveApplication: async (jobId, status = 'saved') => {
    const response = await axiosInstance.post('/applications', { jobId, status });
    return response.data;
  },

  updateApplicationStatus: async (applicationId, status) => {
    const response = await axiosInstance.patch(`/applications/${applicationId}`, { status });
    return response.data;
  },

  updateApplicationNotes: async (applicationId, notes) => {
    const response = await axiosInstance.patch(`/applications/${applicationId}`, { notes });
    return response.data;
  },

  deleteApplication: async (applicationId) => {
    const response = await axiosInstance.delete(`/applications/${applicationId}`);
    return response.data;
  }
};
