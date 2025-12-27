const express = require("express");
const router = express.Router();
const {
  getAllRequiredDocuments,
  getRequiredDocumentById,
  createRequiredDocument,
  updateRequiredDocument,
  deleteRequiredDocument,
} = require("../controllers/required_document");
const authenticate = require("../middleware/authMiddleware");
const { checkPermission } = require('../middleware/permissions');

// Apply authentication middleware to all routes
router.use(authenticate);

// GET all required documents
router.get("/", checkPermission('required_documents', 'read'), getAllRequiredDocuments);

// GET a single required document by ID
router.get("/:id", checkPermission('required_documents', 'read'), getRequiredDocumentById);

// POST create a new required document
router.post("/", checkPermission('required_documents', 'create'), createRequiredDocument);

// PUT update a required document
router.put("/:id", checkPermission('required_documents', 'update'), updateRequiredDocument);

// DELETE a required document
router.delete("/:id", checkPermission('required_documents', 'delete'), deleteRequiredDocument);

module.exports = router;
