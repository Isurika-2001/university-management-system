const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

// Get all exams
router.get('/', authenticate, checkPermission('exams', 'read'), examController.getAllExams);

// Create exam
router.post('/', authenticate, checkPermission('exams', 'create'), examController.createExam);

// Get exams for a classroom
router.get('/classroom/:classroomId', authenticate, checkPermission('exams', 'read'), examController.getExamsByClassroom);

// Get exam with marks
router.get('/:id', authenticate, checkPermission('exams', 'read'), examController.getExam);

// Add mark (take) for student
router.post('/:id/mark', authenticate, checkPermission('exams', 'update'), examController.addMark);

// Update mark for a take
router.put('/mark/:examMarkId/take/:takeId', authenticate, checkPermission('exams', 'update'), examController.updateMark);

module.exports = router;
