const express = require('express');
const router = express.Router();
const {
  getAllRequiredDocuments,
  getRequiredDocumentById,
  createRequiredDocument,
  updateRequiredDocument,
  deleteRequiredDocument,
} = require('../controllers/required_document');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

// Apply authentication middleware to all routes
router.use(authenticate);

// GET all required documents
router.get('/', checkPermission('requiredDocument', 'read'), getAllRequiredDocuments);

// GET a single required document by ID
router.get('/:id', checkPermission('requiredDocument', 'read'), getRequiredDocumentById);

// POST create a new required document
router.post('/', checkPermission('requiredDocument', 'create'), createRequiredDocument);

// PUT update a required document
router.put('/:id', checkPermission('requiredDocument', 'update'), updateRequiredDocument);

// DELETE a required document
router.delete('/:id', checkPermission('requiredDocument', 'delete'), deleteRequiredDocument);

module.exports = router;
