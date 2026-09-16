import axiosInstance from './axiosInstance';

export const aiApi = {
  generateCoverLetter: async (jobId) => {
    // Increased timeout since Gemini 1.5 Pro can take 15-20s for long text generation
    const response = await axiosInstance.post(`/ai/cover-letter/${jobId}`, {}, { timeout: 60000 });
    return response.data;
  },

  generateInterviewQuestions: async (jobId) => {
    // Increased timeout for flash response
    const response = await axiosInstance.post(`/ai/interview-prep/${jobId}`, {}, { timeout: 30000 });
    return response.data;
  }
};
