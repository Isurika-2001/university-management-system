import { api, apiRoutes } from './index';

export const authAPI = {
  // Login user
  login: async (credentials) => {
    return api.post(apiRoutes.authRoute + 'login', credentials);
  },

  // Register user
  register: async (userData) => {
    return api.post(apiRoutes.authRoute + 'register', userData);
  },

  // Logout user
  logout: async () => {
    return api.post(apiRoutes.authRoute + 'logout');
  },

  // Refresh token
  refreshToken: async () => {
    return api.post(apiRoutes.authRoute + 'refresh');
  },

  // Get current user profile
  getProfile: async () => {
    return api.get(apiRoutes.authRoute + 'profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return api.put(apiRoutes.authRoute + 'profile', profileData);
  }
};
