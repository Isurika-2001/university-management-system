const express = require('express');
const { getActivityLogs, getActivityLogById, getActivityStats } = require('../controllers/activity_log');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();

// Get all activity logs with filtering and pagination
router.get('/', authenticate, checkPermission('reports', 'read'), getActivityLogs);

// Get activity log by ID
router.get('/:id', authenticate, checkPermission('reports', 'read'), getActivityLogById);

// Get activity statistics
router.get('/stats/summary', authenticate, checkPermission('reports', 'read'), getActivityStats);

module.exports = router;
 