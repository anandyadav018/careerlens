import axiosInstance from './axiosInstance';

export const analyticsApi = {
  getDashboardStats: () => axiosInstance.get('/analytics/dashboard'),
  getTrendingSkills:  () => axiosInstance.get('/analytics/skills'),
  getSkillGaps:       () => axiosInstance.get('/analytics/skill-gaps'),
};
