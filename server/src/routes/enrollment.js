const express = require('express');
const {
  getAllEnrollments,
  getEnrollmentById,
  getAllEnrollmentsByStudentId,
  exportEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  addBatchTransfer,
  getBatchTransferHistory
} = require('../controllers/enrollment');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Enrollment CRUD operations
router.get('/export', checkPermission('enrollments', 'export'), exportEnrollments);
router.get('/student/:id', checkPermission('enrollments', 'read'), getAllEnrollmentsByStudentId);
router.get('/:id', checkPermission('enrollments', 'read'), getEnrollmentById);
router.get('/', checkPermission('enrollments', 'read'), getAllEnrollments);
router.post('/', checkPermission('enrollments', 'create'), createEnrollment);
router.put('/:id', checkPermission('enrollments', 'update'), updateEnrollment);
router.delete('/:id', checkPermission('enrollments', 'delete'), deleteEnrollment);

// Batch transfer operations
router.post('/:id/batch-transfer', checkPermission('enrollments', 'update'), addBatchTransfer);
router.get('/:id/batch-transfer-history', checkPermission('enrollments', 'read'), getBatchTransferHistory);

module.exports = router;
