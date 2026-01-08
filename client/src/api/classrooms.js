import { api, apiRoutes } from './index';

export const classroomAPI = {
  // Get all classrooms
  getAll: async (params = {}) => {
    return api.get(apiRoutes.classroomRoute, params);
  },

  // Get classroom by ID
  getById: async (id) => {
    return api.get(`${apiRoutes.classroomRoute}${id}?fresh=true`);
  },

  getByCourseAndBatch: async (courseId, batchId) => {
    return api.get(`${apiRoutes.classroomRoute}course/${courseId}/batch/${batchId}`);
  },

  // Create classroom
  create: async (data) => {
    return api.post(apiRoutes.classroomRoute, data);
  },

  // Get eligible classrooms for a student
  getEligibleClassrooms: async (enrollmentId, classroomId) => {
    return api.get(`${apiRoutes.classroomRoute}eligible/${enrollmentId}/${classroomId}`);
  },

  // Add student to classroom
  addStudentToClassroom: async (data) => {
    return api.post(`${apiRoutes.classroomRoute}student/add`, data);
  },

  // Update student status in classroom
  updateStudentStatus: async (classroomStudentId, status) => {
    return api.put(`${apiRoutes.classroomRoute}student/${classroomStudentId}/status`, { status });
  },

  // Remove student from classroom
  removeStudent: async (classroomStudentId) => {
    return api.delete(`${apiRoutes.classroomRoute}student/${classroomStudentId}`);
  },

  // Delete classroom
  delete: async (id) => {
    return api.delete(`${apiRoutes.classroomRoute}${id}`);
  }
};

export default classroomAPI;
