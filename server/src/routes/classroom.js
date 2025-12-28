const express = require('express');
const router = express.Router();
const {
  getAllClassrooms,
  createClassroom,
  getClassroomById,
  getEligibleClassrooms,
  addStudentToClassroom,
  removeStudentFromClassroom,
  updateStudentStatus,
  deleteClassroom,
  getClassroomsByCourseAndBatch
} = require('../controllers/classroom');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

router.get('/', authenticate, checkPermission('classrooms', 'read'), getAllClassrooms);
router.post('/', authenticate, checkPermission('classrooms', 'create'), createClassroom);
router.get('/course/:courseId/batch/:batchId', authenticate, checkPermission('classrooms', 'read'), getClassroomsByCourseAndBatch);
router.get('/:id', authenticate, checkPermission('classrooms', 'read'), getClassroomById);
router.get('/eligible/:enrollmentId', authenticate, checkPermission('classrooms', 'read'), getEligibleClassrooms);
router.post('/student/add', authenticate, checkPermission('classrooms', 'update'), addStudentToClassroom);
router.put('/student/:id/status', authenticate, checkPermission('classrooms', 'update'), updateStudentStatus);
router.delete('/student/:id', authenticate, checkPermission('classrooms', 'update'), removeStudentFromClassroom);
router.delete('/:id', authenticate, checkPermission('classrooms', 'delete'), deleteClassroom);

module.exports = router;
