import { api, apiRoutes } from './index';

export const modulesAPI = {
  // Get modules. If params.courseId provided, returns modules array for that course.
  getAll: async (params = {}) => {
    return api.get(apiRoutes.modulesRoute, params);
  },

  // Upsert modules for a course
  upsert: async (payload) => {
    return api.post(`${apiRoutes.modulesRoute}upsert`, payload);
  }
};

export default modulesAPI;
