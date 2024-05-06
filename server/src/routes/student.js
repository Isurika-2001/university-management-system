// studentRoutes.js

const express = require('express');
const { getAllStudents, getStudentById, createStudent } = require('../controllers/student');

const router = express.Router();

router.get('/students', getAllStudents);
router.post('/student', createStudent);
router.get('/students/:id', getStudentById);

// Define other routes

module.exports = router;
