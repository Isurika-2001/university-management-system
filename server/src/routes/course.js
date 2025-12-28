// courseRoutes.js

const express = require('express');
const { getAllCourses, createCourse, getCourseById, editCourse, deleteCourse } = require('../controllers/course');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

// middleware calling
const { checkStudentsAssignedToCourse } = require('../middleware/studentMiddleware');

const router = express.Router();

router.get('/', authenticate, checkPermission('course', 'read'), getAllCourses);
router.post('/', authenticate, checkPermission('course', 'create'), createCourse);
router.get('/:id', authenticate, checkPermission('course', 'read'), getCourseById);
router.put('/:id', authenticate, checkPermission('course', 'update'), editCourse);
router.delete('/:id', authenticate, checkPermission('course', 'delete'), checkStudentsAssignedToCourse, deleteCourse);

// Define other routes

module.exports = router;
