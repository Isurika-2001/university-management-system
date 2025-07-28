// batchRoutes.js

const express = require("express");
const { getEnrollmentSummaryStats } = require("../controllers/stats");

const router = express.Router();

router.get("/enrollment", getEnrollmentSummaryStats);

// Define other routes

module.exports = router;
