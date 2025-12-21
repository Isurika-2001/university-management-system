import { api, apiRoutes } from './index';

export const examAPI = {
  listAll: () => api.get(apiRoutes.examRoute),
  create: (payload) => api.post(apiRoutes.examRoute, payload),
  listByClassroom: (classroomId) => api.get(`${apiRoutes.examRoute}classroom/${classroomId}`),
  get: (id) => api.get(`${apiRoutes.examRoute}${id}`),
  addMark: (examId, payload) => api.post(`${apiRoutes.examRoute}${examId}/mark`, payload)
};

export default examAPI;
