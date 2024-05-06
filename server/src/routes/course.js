// courseRoutes.js

const express = require("express");
const { getAllCourses, createCourse } = require("../controllers/course");

const router = express.Router();

router.get("/courses", getAllCourses);
router.post("/course", createCourse);

// Define other routes

module.exports = router;
