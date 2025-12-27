// courseRoutes.js

const express = require("express");
const { getAllCourses, createCourse, getCourseById, editCourse, deleteCourse } = require("../controllers/course");
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

// middleware calling
const { checkStudentsAssignedToCourse } = require("../middleware/studentMiddleware");

const router = express.Router();

router.get("/", authenticate, checkPermission('courses', 'read'), getAllCourses);
router.post("/", authenticate, checkPermission('courses', 'create'), createCourse);
router.get("/:id", authenticate, checkPermission('courses', 'read'), getCourseById);
router.put("/:id", authenticate, checkPermission('courses', 'update'), editCourse);
router.delete("/:id", authenticate, checkPermission('courses', 'delete'), checkStudentsAssignedToCourse, deleteCourse);

// Define other routes

module.exports = router;
