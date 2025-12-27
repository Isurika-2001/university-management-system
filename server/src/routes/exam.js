const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam');

// Get all exams
router.get('/', examController.getAllExams);

// Create exam
router.post('/', examController.createExam);

// Get exams for a classroom
router.get('/classroom/:classroomId', examController.getExamsByClassroom);

// Get exam with marks
router.get('/:id', examController.getExam);

// Add mark (take) for student
router.post('/:id/mark', examController.addMark);

// Update mark for a take
router.put('/mark/:examMarkId/take/:takeId', examController.updateMark);

module.exports = router;
