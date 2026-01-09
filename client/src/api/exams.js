import { api, apiRoutes } from './index';

export const examAPI = {
  listAll: (
    { page, limit, sortBy, sortOrder, search, courseId, batchId } = {
      page: 0,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: '',
      courseId: undefined,
      batchId: undefined
    }
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      search: search || ''
    });
    if (courseId) params.append('courseId', courseId);
    if (batchId) params.append('batchId', batchId);
    return api.get(`${apiRoutes.examRoute}?${params.toString()}`);
  },
  create: (payload) => api.post(apiRoutes.examRoute, payload),
  listByClassroom: (classroomId) => api.get(`${apiRoutes.examRoute}classroom/${classroomId}`),
  get: (id) => api.get(`${apiRoutes.examRoute}${id}`),
  addMark: (examId, payload) => api.post(`${apiRoutes.examRoute}${examId}/mark`, payload),
  updateMark: (examMarkId, takeId, payload) => api.put(`${apiRoutes.examRoute}mark/${examMarkId}/take/${takeId}`, payload)
};

export default examAPI;
