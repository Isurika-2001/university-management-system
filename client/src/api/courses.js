import { api, apiRoutes } from './index';

export const coursesAPI = {
  // Get all courses with pagination and filters
  getAll: async (params = {}) => {
    return api.get(apiRoutes.courseRoute, params);
  },

  // Get course by ID
  getById: async (id) => {
    return api.get(`${apiRoutes.courseRoute}${id}`);
  },

  // Create new course
  create: async (courseData) => {
    return api.post(apiRoutes.courseRoute, courseData);
  },

  // Update course
  update: async (id, courseData) => {
    return api.put(`${apiRoutes.courseRoute}${id}`, courseData);
  },

  // Delete course
  delete: async (id) => {
    return api.delete(`${apiRoutes.courseRoute}${id}`);
  },

  // Bulk delete courses
  bulkDelete: async (ids) => {
    return api.post(`${apiRoutes.courseRoute}bulk-delete`, { ids });
  },

  // Search courses
  search: async (searchTerm, params = {}) => {
    return api.get(apiRoutes.courseRoute, { search: searchTerm, ...params });
  }
}; 