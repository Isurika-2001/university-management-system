import { api, apiRoutes } from './index';

export const statsAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    return api.get(apiRoutes.statRoute + 'dashboard');
  },

  // get batch statistics
  getBatchStats: async (params = {}) => {
    return api.get(apiRoutes.statRoute + 'batchDates', params);
  },

  // Get enrollment statistics
  getEnrollmentStats: async (params = {}) => {
    return api.get(apiRoutes.statRoute + 'enrollments', params);
  },

  // Get payment statistics
  getPaymentStats: async (params = {}) => {
    return api.get(apiRoutes.statRoute + 'payments', params);
  },

  // Get user activity statistics
  getUserActivityStats: async (params = {}) => {
    return api.get(apiRoutes.statRoute + 'user-activity', params);
  },

  // Get course statistics
  getCourseStats: async (params = {}) => {
    return api.get(apiRoutes.statRoute + 'courses', params);
  },

  // Get recent activities
  getRecentActivities: async (params = {}) => {
    return api.get(apiRoutes.activityLogsRoute, params);
  },

  // get recent students
  getRecentStudents: async (params = {}) => {
    return api.get(apiRoutes.statRoute + 'recentStudents', params);
  }
}; 