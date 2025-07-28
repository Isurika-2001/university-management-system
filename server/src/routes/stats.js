// batchRoutes.js

const express = require("express");
const { getEnrollmentSummaryStats, getUpcomingBatchDates } = require("../controllers/stats");

const router = express.Router();

router.get("/enrollment", getEnrollmentSummaryStats);
router.get("/batchDates", getUpcomingBatchDates);

// Define other routes

module.exports = router;
