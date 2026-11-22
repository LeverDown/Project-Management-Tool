import api from './axios.js';

export const getTasksByProjectApi = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data;
};

export const createTaskApi = async (projectId, taskData) => {
  const response = await api.post(`/projects/${projectId}/tasks`, taskData);
  return response.data;
};

export const getTaskByIdApi = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const updateTaskApi = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTaskApi = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

export const reorderTasksApi = async (reorderData) => {
  const response = await api.patch('/tasks/reorder', reorderData);
  return response.data;
};
