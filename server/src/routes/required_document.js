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
router.get("/", checkPermission('finance', 'read'), getAllRequiredDocuments);

// GET a single required document by ID
router.get("/:id", checkPermission('finance', 'read'), getRequiredDocumentById);

// POST create a new required document
router.post("/", checkPermission('finance', 'create'), createRequiredDocument);

// PUT update a required document
router.put("/:id", checkPermission('finance', 'update'), updateRequiredDocument);

// DELETE a required document
router.delete("/:id", checkPermission('finance', 'delete'), deleteRequiredDocument);

module.exports = router;
