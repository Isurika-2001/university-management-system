const express = require('express');
const router = express.Router();
const {
  getAllRequiredDocuments,
  getRequiredDocumentById,
  createRequiredDocument,
  updateRequiredDocument,
  deleteRequiredDocument
} = require('../controllers/required_document');

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

module.exports = router;
