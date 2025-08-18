// batchRoutes.js

const express = require("express");
const { getEnrollmentSummaryStats, getUpcomingBatchDates, getCourseEnrollments, getEnrollmentNumbers, getRecentStudents, getCourseDistribution } = require("../controllers/stats");

const router = express.Router();

router.get("/enrollment", getEnrollmentSummaryStats);
router.get("/batchDates", getUpcomingBatchDates);
router.get("/enrollments", getCourseEnrollments);
router.get("/enrollmentTrends", getEnrollmentNumbers);
router.get("/recentStudents", getRecentStudents);
router.get("/courseDistribution", getCourseDistribution);

// Define other routes

module.exports = router;
