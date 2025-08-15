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
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Enrollment CRUD operations
router.get('/export', exportEnrollments);
router.get('/student/:id', getAllEnrollmentsByStudentId);
router.get('/:id', getEnrollmentById);
router.get('/', getAllEnrollments);
router.post('/', createEnrollment);
router.put('/:id', updateEnrollment);
router.delete('/:id', deleteEnrollment);

// Batch transfer operations
router.post('/:id/batch-transfer', addBatchTransfer);
router.get('/:id/batch-transfer-history', getBatchTransferHistory);

module.exports = router;
