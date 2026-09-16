import api from './axiosInstance';

export const alertApi = {
  getAlerts: () => api.get('/alerts'),
  createAlert: (data) => api.post('/alerts', data),
  updateAlert: (id, data) => api.patch(`/alerts/${id}`, data),
  toggleAlert: (id) => api.patch(`/alerts/${id}/toggle`),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
};
