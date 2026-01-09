const express = require('express');
const router = express.Router();
const {
  getAllRequiredDocuments,
  getRequiredDocumentById,
  createRequiredDocument,
  updateRequiredDocument,
  deleteRequiredDocument
} = require('../controllers/required_document');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all required documents (with pagination, search, sorting)
router.get('/', checkPermission('requiredDocument', 'read'), getAllRequiredDocuments);

// Get a single required document by ID
router.get('/:id', checkPermission('requiredDocument', 'read'), getRequiredDocumentById);

// Create a new required document
router.post('/', checkPermission('requiredDocument', 'create'), createRequiredDocument);

// Update a required document
router.put('/:id', checkPermission('requiredDocument', 'update'), updateRequiredDocument);

// Delete a required document
router.delete('/:id', checkPermission('requiredDocument', 'delete'), deleteRequiredDocument);

module.exports = router;
