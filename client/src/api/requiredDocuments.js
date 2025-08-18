import { api, apiRoutes } from './index';

export const requiredDocumentsAPI = {
  // Get all required documents with pagination and filters
  getAll: async (params = {}) => {
    return api.get(apiRoutes.requiredDocumentRoute, params);
  },

  // Get a single required document by ID
  getById: async (id) => {
    return api.get(`${apiRoutes.requiredDocumentRoute}${id}`);
  },

  // Create a new required document
  create: async (data) => {
    return api.post(apiRoutes.requiredDocumentRoute, data);
  },

  // Update a required document
  update: async (id, data) => {
    return api.put(`${apiRoutes.requiredDocumentRoute}${id}`, data);
  },

  // Delete a required document
  delete: async (id) => {
    return api.delete(`${apiRoutes.requiredDocumentRoute}${id}`);
  },

  // Bulk delete required documents
  bulkDelete: async (ids) => {
    return api.post(`${apiRoutes.requiredDocumentRoute}bulk-delete`, { ids });
  },

  // Search required documents
  search: async (searchTerm, params = {}) => {
    return api.get(apiRoutes.requiredDocumentRoute, { search: searchTerm, ...params });
  }
};
