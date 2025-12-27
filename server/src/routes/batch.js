// intakeRoutes.js (formerly batchRoutes)

const express = require('express');
const { getAllBatches, createBatch, getBatchesByCourseId, deleteBatch, getBatchById, updateBatch } = require('../controllers/batch');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

// middleware calling
const { checkStudentsAssignedToBatch } = require('../middleware/studentMiddleware');

const router = express.Router();

router.get('/', authenticate, checkPermission('batch', 'read'), getAllBatches);
router.post('/', authenticate, checkPermission('batch', 'create'), createBatch);
router.get('/:id', authenticate, checkPermission('batch', 'read'), getBatchById);
router.put('/:id', authenticate, checkPermission('batch', 'update'), checkStudentsAssignedToBatch, updateBatch);
router.delete('/:id', authenticate, checkPermission('batch', 'delete'), checkStudentsAssignedToBatch, deleteBatch);
router.get('/course/:courseId', authenticate, checkPermission('batch', 'read'), getBatchesByCourseId);

// Define other routes

module.exports = router;
