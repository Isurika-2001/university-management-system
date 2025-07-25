// studentRoutes.js

const express = require('express');
const { getAllStudents, getStudentById, createStudent, updateStudent, AddCourseRegistration, deleteCourseRegistration } = require('../controllers/student');

const router = express.Router();

router.get('/', getAllStudents);
router.post('/', createStudent);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.post('/course_registration/:id', AddCourseRegistration);
router.delete('/course_registration/:id', deleteCourseRegistration);

// Define other routes

module.exports = router;
