// courseRoutes.js

const express = require("express");
const { getAllCourses, createCourse } = require("../controllers/course");

const router = express.Router();

router.get("/", getAllCourses);
router.post("/", createCourse);

// Define other routes

module.exports = router;
