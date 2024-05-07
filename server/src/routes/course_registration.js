
// course_registrationRoutes.js

const express = require('express');
const { getAllCourseRegistrations, getCourseRegistrationById, getAllCourseRegistrationsByStudentId } = require('../controllers/course_registration');

const router = express.Router();

router.get('/course_registrations', getAllCourseRegistrations);
router.get('/course_registrations/:id', getCourseRegistrationById);
router.get('/course_registrations/student/:id', getAllCourseRegistrationsByStudentId);

// Define other routes

module.exports = router;
