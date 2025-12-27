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

router.get('/', getAllClassrooms);
router.post('/', createClassroom);
router.get('/course/:courseId/batch/:batchId', getClassroomsByCourseAndBatch);
router.get('/:id', getClassroomById);
router.get('/eligible/:enrollmentId', getEligibleClassrooms);
router.post('/student/add', addStudentToClassroom);
router.put('/student/:id/status', updateStudentStatus);
router.delete('/student/:id', removeStudentFromClassroom);
router.delete('/:id', deleteClassroom);

module.exports = router;
