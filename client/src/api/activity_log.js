import { api, apiRoutes } from './index';

export const activityLogAPI = {
  // Get activity logs with pagination and filters
  getAll: async (params = {}) => {
    return api.get(apiRoutes.activityLogsRoute, params);
  },

  // Get activity log by ID
  getById: async (id) => {
    return api.get(`${apiRoutes.activityLogsRoute}${id}`);
  },

  // Create new activity log
  create: async (logData) => {
    return api.post(apiRoutes.activityLogsRoute, logData);
  },

  // Update activity log
  update: async (id, logData) => {
    return api.put(`${apiRoutes.activityLogsRoute}${id}`, logData);
  },

  // Delete activity log
  delete: async (id) => {
    return api.delete(`${apiRoutes.activityLogsRoute}${id}`);
  },

  // Get recent activity logs (for notifications)
  getRecent: async (limit = 3) => {
    return api.get(apiRoutes.activityLogsRoute, { limit, sort: '-timestamp' });
  },

  // Search activity logs
  search: async (searchTerm, params = {}) => {
    return api.get(apiRoutes.activityLogsRoute, { search: searchTerm, ...params });
  },

  // Get activity logs by user
  getByUser: async (userId, params = {}) => {
    return api.get(apiRoutes.activityLogsRoute, { userId, ...params });
  },

  // Get activity logs by entity type
  getByEntityType: async (entityType, params = {}) => {
    return api.get(apiRoutes.activityLogsRoute, { entityType, ...params });
  }
};

// Export individual functions for easier imports
export const getActivityLogs = activityLogAPI.getAll;
export const getRecentActivityLogs = activityLogAPI.getRecent;
