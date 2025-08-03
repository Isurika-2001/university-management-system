import { api, apiRoutes } from './index';

export const bulkUploadAPI = {
  // Upload students in bulk
  uploadStudents: async (fileData) => {
    return api.post(apiRoutes.bulkUploadRoute + 'students', fileData);
  },

  // Upload courses in bulk
  uploadCourses: async (fileData) => {
    return api.post(apiRoutes.bulkUploadRoute + 'courses', fileData);
  },

  // Upload batches in bulk
  uploadBatches: async (fileData) => {
    return api.post(apiRoutes.bulkUploadRoute + 'batches', fileData);
  },

  // Get upload status
  getUploadStatus: async (uploadId) => {
    return api.get(`${apiRoutes.bulkUploadRoute}status/${uploadId}`);
  },

  // Get upload history
  getUploadHistory: async (params = {}) => {
    return api.get(apiRoutes.bulkUploadRoute + 'history', params);
  },

  // Download template
  downloadTemplate: async (type) => {
    return api.get(`${apiRoutes.bulkUploadRoute}template/${type}`);
  }
}; 