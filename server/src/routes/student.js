// studentRoutes.js

const express = require('express');
const { getAllStudents, getStudentById, createStudent, updateStudent, AddCourseRegistration, deleteCourseRegistration } = require('../controllers/student');

const router = express.Router();

router.get('/students', getAllStudents);
router.post('/student', createStudent);
router.get('/students/:id', getStudentById);
router.put('/students/:id', updateStudent);
router.post('/students/course_registration/:id', AddCourseRegistration);
router.delete('/students/course_registration/:id', deleteCourseRegistration);

// Define other routes

module.exports = router;
