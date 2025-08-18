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

// Apply authentication middleware to all routes
router.use(authenticate);

// GET all required documents
router.get("/", getAllRequiredDocuments);

// GET a single required document by ID
router.get("/:id", getRequiredDocumentById);

// POST create a new required document
router.post("/", createRequiredDocument);

// PUT update a required document
router.put("/:id", updateRequiredDocument);

// DELETE a required document
router.delete("/:id", deleteRequiredDocument);

module.exports = router;
