import api from './axios.js';

export const getProjectAnalyticsApi = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/analytics`);
  return response.data;
};
