import { api, apiRoutes } from './index';

export const studentsAPI = {
  // Get all students with pagination and filters
  getAll: async (params = {}) => {
    return api.get(apiRoutes.studentRoute, params);
  },

  // Get student by ID
  getById: async (id) => {
    return api.get(`${apiRoutes.studentRoute}${id}`);
  },

  // Create new student
  create: async (studentData) => {
    return api.post(apiRoutes.studentRoute, studentData);
  },

  // Update student
  update: async (id, studentData) => {
    return api.put(`${apiRoutes.studentRoute}${id}`, studentData);
  },

  // Update student status
  updateStatus: async (studentId, status) => {
    return api.patch(`${apiRoutes.studentRoute}${studentId}/status`, { status });
  },

  // Delete student
  delete: async (id) => {
    return api.delete(`${apiRoutes.studentRoute}${id}`);
  },

  // Bulk delete students
  bulkDelete: async (ids) => {
    return api.post(`${apiRoutes.studentRoute}bulk-delete`, { ids });
  },

  // Search students
  search: async (searchTerm, params = {}) => {
    return api.get(apiRoutes.studentRoute, { search: searchTerm, ...params });
  },

  // Get enrollment classroom history
  getEnrollmentClassroomHistory: async (enrollmentId) => {
    return api.get(`${apiRoutes.studentRoute}enrollment/${enrollmentId}/history`);
  }
};
