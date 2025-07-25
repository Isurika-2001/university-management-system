const express = require("express");
const router = express.Router();

const studentRoutes = require("./student");
const courseRoutes = require("./course");
const batchRoutes = require("./batch");
const courseRegistrationRoutes = require("./course_registration");
const user_typeRoutes = require("./user_type");
const userRoutes = require("./user");
const authRoutes = require("./auth");

// Mount sub-routes onto router
router.use("/student", studentRoutes);
router.use("/course", courseRoutes);
router.use("/batch", batchRoutes);
router.use("/course-registration", courseRegistrationRoutes);
router.use("/user-type", user_typeRoutes);
router.use("/user", userRoutes);
router.use("/auth", authRoutes);

module.exports = router;
