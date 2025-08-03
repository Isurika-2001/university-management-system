import { api, apiRoutes } from './index';

export const courseRegistrationsAPI = {
  // Get all course registrations with pagination and filters
  getAll: async (params = {}) => {
    return api.get(apiRoutes.courseRegistrationRoute, params);
  },

  // Get course registration by ID
  getById: async (id) => {
    return api.get(`${apiRoutes.courseRegistrationRoute}${id}`);
  },

  // Create new course registration
  create: async (registrationData) => {
    return api.post(apiRoutes.courseRegistrationRoute, registrationData);
  },

  // Update course registration
  update: async (id, registrationData) => {
    return api.put(`${apiRoutes.courseRegistrationRoute}${id}`, registrationData);
  },

  // Delete course registration
  delete: async (id) => {
    return api.delete(`${apiRoutes.courseRegistrationRoute}${id}`);
  },

  // Bulk delete course registrations
  bulkDelete: async (ids) => {
    return api.post(`${apiRoutes.courseRegistrationRoute}bulk-delete`, { ids });
  },

  // Search course registrations
  search: async (searchTerm, params = {}) => {
    return api.get(apiRoutes.courseRegistrationRoute, { search: searchTerm, ...params });
  },

  // Get course registrations by student ID
  getByStudentId: async (studentId) => {
    return api.get(`${apiRoutes.courseRegistrationRoute}student/${studentId}`);
  },

  // Create course registration for a student
  createForStudent: async (studentId, registrationData) => {
    return api.post(`${apiRoutes.studentRoute}course_registration/${studentId}`, registrationData);
  }
}; 