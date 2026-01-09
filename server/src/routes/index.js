const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authMiddleware');

const studentRoutes = require('./student');
const courseRoutes = require('./course');
const batchRoutes = require('./batch');
const enrollmentRoutes = require('./enrollment');
const requiredDocumentRoutes = require('./requiredDocument');
const moduleRoutes = require('./module');
const classroomRoutes = require('./classroom');
const examRoutes = require('./exam');
const userTypeRoutes = require('./user_type');
const userRoutes = require('./user');
const authRoutes = require('./auth');
const bulkUploadRoutes = require('./bulk_upload');
const statsRoute = require('./stats');
const activityLogRoutes = require('./activity_log');

// Public auth routes
router.use('/auth', authRoutes);

// User routes - /me endpoint needs to be accessible but protected
// Mount user routes before global authenticate so /me can use its own authenticate
router.use('/user', userRoutes);

// Protected routes (all other routes)
router.use(authenticate);
router.use('/student', studentRoutes);
router.use('/course', courseRoutes);
router.use('/batch', batchRoutes);
router.use('/enrollment', enrollmentRoutes);
router.use('/required-document', requiredDocumentRoutes);
router.use('/user-type', userTypeRoutes);
router.use('/module', moduleRoutes);
router.use('/classroom', classroomRoutes);
router.use('/exam', examRoutes);
router.use('/bulk-upload', bulkUploadRoutes);
router.use('/stats', statsRoute);
router.use('/activity-logs', activityLogRoutes);

module.exports = router;
