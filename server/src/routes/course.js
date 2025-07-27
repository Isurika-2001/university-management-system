// courseRoutes.js

const express = require("express");
const { getAllCourses, createCourse, getCourseById, editCourse } = require("../controllers/course");

const router = express.Router();

router.get("/", getAllCourses);
router.post("/", createCourse);
router.get("/:id", getCourseById);
router.put("/:id", editCourse);

// Define other routes

module.exports = router;
