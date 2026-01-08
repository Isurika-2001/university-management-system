import { api, apiRoutes } from './index';

export const examAPI = {
  listAll: (
    { page, limit, sortBy, sortOrder, search } = {
      page: 0,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: ''
    }
  ) => {
    const query = `?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}`;
    return api.get(`${apiRoutes.examRoute}${query}`);
  },
  create: (payload) => api.post(apiRoutes.examRoute, payload),
  listByClassroom: (classroomId) => api.get(`${apiRoutes.examRoute}classroom/${classroomId}`),
  get: (id) => api.get(`${apiRoutes.examRoute}${id}`),
  addMark: (examId, payload) => api.post(`${apiRoutes.examRoute}${examId}/mark`, payload),
  updateMark: (examMarkId, takeId, payload) => api.put(`${apiRoutes.examRoute}mark/${examMarkId}/take/${takeId}`, payload)
};

export default examAPI;
