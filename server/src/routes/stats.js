// batchRoutes.js

const express = require("express");
const { getEnrollmentSummaryStats, getUpcomingBatchDates, getCourseRegistrations } = require("../controllers/stats");

const router = express.Router();

router.get("/enrollment", getEnrollmentSummaryStats);
router.get("/batchDates", getUpcomingBatchDates);
router.get("/registrations", getCourseRegistrations);

// Define other routes

module.exports = router;
