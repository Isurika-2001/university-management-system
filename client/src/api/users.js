import { api, apiRoutes } from './index';

export const usersAPI = {
  // Get all users with pagination and filters
  getAll: async (params = {}) => {
    return api.get(apiRoutes.userRoute, params);
  },

  // Get user by ID
  getById: async (id) => {
    return api.get(`${apiRoutes.userRoute}${id}`);
  },

  // Create new user
  create: async (userData) => {
    return api.post(apiRoutes.userRoute, userData);
  },

  // Update user
  update: async (id, userData) => {
    return api.put(`${apiRoutes.userRoute}${id}`, userData);
  },

  // Delete user
  delete: async (id) => {
    return api.delete(`${apiRoutes.userRoute}${id}`);
  },

  // Bulk delete users
  bulkDelete: async (ids) => {
    return api.post(`${apiRoutes.userRoute}bulk-delete`, { ids });
  },

  // Search users
  search: async (searchTerm, params = {}) => {
    return api.get(apiRoutes.userRoute, { search: searchTerm, ...params });
  },

  // Get user types
  getUserTypes: async () => {
    return api.get(apiRoutes.userTypeRoute);
  }
}; 