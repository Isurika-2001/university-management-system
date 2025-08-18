const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/permissions');
const {
  getAllRequiredDocuments,
  getRequiredDocumentById,
  createRequiredDocument,
  updateRequiredDocument,
  deleteRequiredDocument,
  bulkDeleteRequiredDocuments
} = require('../controllers/requiredDocument');

// Get all required documents (with pagination, search, sorting)
router.get('/', getAllRequiredDocuments);

// Get a single required document by ID
router.get('/:id', getRequiredDocumentById);

// Create a new required document
router.post('/', createRequiredDocument);

// Update a required document
router.put('/:id', updateRequiredDocument);

// Delete a required document
router.delete('/:id', deleteRequiredDocument);

// Bulk delete required documents
router.post('/bulk-delete', bulkDeleteRequiredDocuments);

module.exports = router;
