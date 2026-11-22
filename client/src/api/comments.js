import api from './axios.js';

export const getCommentsByTaskApi = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/comments`);
  return response.data;
};

export const createCommentApi = async (taskId, commentData) => {
  const response = await api.post(`/tasks/${taskId}/comments`, commentData);
  return response.data;
};

export const deleteCommentApi = async (id) => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};
