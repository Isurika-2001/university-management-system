// batchRoutes.js

const express = require("express");
const { getEnrollmentSummaryStats, getUpcomingBatchDates, getCourseRegistrations, getEnrollmentNumbers, getRecentStudents } = require("../controllers/stats");

const router = express.Router();

router.get("/enrollment", getEnrollmentSummaryStats);
router.get("/batchDates", getUpcomingBatchDates);
router.get("/registrations", getCourseRegistrations);
router.get("/enrollmentTrends", getEnrollmentNumbers);
router.get("/recentStudents", getRecentStudents);

// Define other routes

module.exports = router;
