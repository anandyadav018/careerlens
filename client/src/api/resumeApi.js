import axiosInstance from './axiosInstance';

export const resumeApi = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await axiosInstance.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // AI processing can take time
    });
    return response.data;
  },

  getUserResumes: async () => {
    const response = await axiosInstance.get('/resumes');
    return response.data;
  },

  // Alias kept for backwards compat
  getResumes: async () => {
    const response = await axiosInstance.get('/resumes');
    return response.data;
  },

  getResumeById: async (id) => {
    const response = await axiosInstance.get(`/resumes/${id}`);
    return response.data;
  },

  deleteResume: async (id) => {
    const response = await axiosInstance.delete(`/resumes/${id}`);
    return response.data;
  },

  activateResume: async (id) => {
    const response = await axiosInstance.patch(`/resumes/${id}/activate`);
    return response.data;
  },

  updateLabel: async (id, label) => {
    const response = await axiosInstance.patch(`/resumes/${id}/label`, { label });
    return response.data;
  },
};
