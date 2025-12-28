const express = require('express');
const { 
  getEnrollmentSummaryStats, 
  getUpcomingBatchDates, 
  getCourseEnrollments, 
  getEnrollmentNumbers, 
  getRecentStudents, 
  getCourseDistribution 
} = require('../controllers/stats');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();

router.get('/enrollment', authenticate, checkPermission('reports', 'read'), getEnrollmentSummaryStats);
router.get('/batchDates', authenticate, checkPermission('reports', 'read'), getUpcomingBatchDates);
router.get('/enrollments', authenticate, checkPermission('reports', 'read'), getCourseEnrollments);
router.get('/enrollmentTrends', authenticate, checkPermission('reports', 'read'), getEnrollmentNumbers);
router.get('/recentStudents', authenticate, checkPermission('reports', 'read'), getRecentStudents);
router.get('/courseDistribution', authenticate, checkPermission('reports', 'read'), getCourseDistribution);

// Define other routes

module.exports = router;
