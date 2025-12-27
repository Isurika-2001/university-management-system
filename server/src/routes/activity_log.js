const express = require('express');
const { getActivityLogs, getActivityLogById, getActivityStats } = require('../controllers/activity_log');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();

// Get all activity logs with filtering and pagination
router.get('/', authenticate, checkPermission('activity_logs', 'read'), getActivityLogs);

// Get activity log by ID
router.get('/:id', authenticate, checkPermission('activity_logs', 'read'), getActivityLogById);

// Get activity statistics
router.get('/stats/summary', authenticate, checkPermission('activity_logs', 'read'), getActivityStats);

module.exports = router;
 