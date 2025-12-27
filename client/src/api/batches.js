import { api, apiRoutes } from './index';

export const batchesAPI = {
  // Get all batches with pagination and filters
  getAll: async (params = {}) => {
    return api.get(apiRoutes.batchRoute, params);
  },

  // Get batch by ID
  getById: async (id) => {
    return api.get(`${apiRoutes.batchRoute}${id}`);
  },

  // Create new batch
  create: async (batchData) => {
    return api.post(apiRoutes.batchRoute, batchData);
  },

  // Update batch
  update: async (id, batchData) => {
    return api.put(`${apiRoutes.batchRoute}${id}`, batchData);
  },

  // Delete batch
  delete: async (id) => {
    return api.delete(`${apiRoutes.batchRoute}${id}`);
  },

  // Bulk delete batches
  bulkDelete: async (ids) => {
    return api.post(`${apiRoutes.batchRoute}bulk-delete`, { ids });
  },

  // Search batches
  search: async (searchTerm, params = {}) => {
    return api.get(apiRoutes.batchRoute, { search: searchTerm, ...params });
  },

  // Get batches by course ID
  getByCourseId: async (courseId) => {
    return api.get(`${apiRoutes.batchRoute}course/${courseId}`);
  }
};
