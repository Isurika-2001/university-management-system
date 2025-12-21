import { api, apiRoutes } from './index';

export const modulesAPI = {
  // Get modules for all pathways
  getAll: async () => {
    return api.get(apiRoutes.modulesRoute);
  },

  // Upsert modules for a pathway
  upsert: async (payload) => {
    return api.post(`${apiRoutes.modulesRoute}upsert`, payload);
  }
};

export default modulesAPI;
