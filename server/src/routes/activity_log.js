const express = require('express');
const { getActivityLogs, getActivityLogById, getActivityStats } = require('../controllers/activity_log');

const router = express.Router();

// Get all activity logs with filtering and pagination
router.get('/', getActivityLogs);

// Get activity log by ID
router.get('/:id', getActivityLogById);

// Get activity statistics
router.get('/stats/summary', getActivityStats);

module.exports = router; 