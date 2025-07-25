
// course_registrationRoutes.js

const express = require('express');
const { getAllCourseRegistrations, getCourseRegistrationById, getAllCourseRegistrationsByStudentId } = require('../controllers/course_registration');

const router = express.Router();

router.get('/', getAllCourseRegistrations);
router.get('/:id', getCourseRegistrationById);
router.get('/student/:id', getAllCourseRegistrationsByStudentId);

// Define other routes

module.exports = router;
