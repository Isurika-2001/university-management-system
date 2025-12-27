const express = require("express");
const { 
  getEnrollmentSummaryStats, 
  getUpcomingBatchDates, 
  getCourseEnrollments, 
  getEnrollmentNumbers, 
  getRecentStudents, 
  getCourseDistribution 
} = require("../controllers/stats");
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();

router.get("/enrollment", authenticate, checkPermission('stats', 'read'), getEnrollmentSummaryStats);
router.get("/batchDates", authenticate, checkPermission('stats', 'read'), getUpcomingBatchDates);
router.get("/enrollments", authenticate, checkPermission('stats', 'read'), getCourseEnrollments);
router.get("/enrollmentTrends", authenticate, checkPermission('stats', 'read'), getEnrollmentNumbers);
router.get("/recentStudents", authenticate, checkPermission('stats', 'read'), getRecentStudents);
router.get("/courseDistribution", authenticate, checkPermission('stats', 'read'), getCourseDistribution);

// Define other routes

module.exports = router;
