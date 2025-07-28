// courseRoutes.js

const express = require("express");
const { getAllCourses, createCourse, getCourseById, editCourse, deleteCourse } = require("../controllers/course");

// middleware calling
const { checkStudentsAssignedToCourse } = require("../middleware/studentMiddleware");

const router = express.Router();

router.get("/", getAllCourses);
router.post("/", createCourse);
router.get("/:id", getCourseById);
router.put("/:id", editCourse);
router.delete("/:id", checkStudentsAssignedToCourse, deleteCourse);

// Define other routes

module.exports = router;
