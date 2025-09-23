import { api, apiRoutes } from './index';

export const enrollmentsAPI = {
  // Get all enrollments with pagination and filters
  getAll: async (params = {}) => {
    return api.get(apiRoutes.enrollmentRoute, params);
  },

  // Get enrollment by ID
  getById: async (id) => {
    return api.get(`${apiRoutes.enrollmentRoute}${id}`);
  },

  // Create new enrollment
  create: async (enrollmentData) => {
    return api.post(apiRoutes.enrollmentRoute, enrollmentData);
  },

  // Update enrollment
  update: async (id, enrollmentData) => {
    return api.put(`${apiRoutes.enrollmentRoute}${id}`, enrollmentData);
  },

  // Delete enrollment
  delete: async (id) => {
    return api.delete(`${apiRoutes.enrollmentRoute}${id}`);
  },

  // Bulk delete enrollments
  bulkDelete: async (ids) => {
    return api.post(`${apiRoutes.enrollmentRoute}bulk-delete`, { ids });
  },

  // Search enrollments
  search: async (searchTerm, params = {}) => {
    return api.get(apiRoutes.enrollmentRoute, { search: searchTerm, ...params });
  },

  // Get enrollments by student ID
  getByStudentId: async (studentId) => {
    return api.get(`${apiRoutes.enrollmentRoute}student/${studentId}`);
  },

  // Create enrollment for a student
  createForStudent: async (studentId, enrollmentData) => {
    return api.post(`${apiRoutes.studentRoute}enrollment/${studentId}`, enrollmentData);
  },

  // add intake transfer to enrollment
  addBatchTransfer: async (enrollmentId, transferData) => {
    return api.post(`${apiRoutes.enrollmentRoute}${enrollmentId}/batch-transfer`, transferData);
  },

  // Get batch transfer history for enrollment
  getBatchTransferHistory: async (enrollmentId) => {
    return api.get(`${apiRoutes.enrollmentRoute}${enrollmentId}/batch-transfers`);
  }
};
