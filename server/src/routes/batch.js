// intakeRoutes.js (formerly batchRoutes)

const express = require("express");
const { getAllBatches, createBatch, getBatchesByCourseId, deleteBatch, getBatchById, updateBatch } = require("../controllers/batch");
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

// middleware calling
const { checkStudentsAssignedToBatch } = require("../middleware/studentMiddleware");

const router = express.Router();

router.get("/", authenticate, checkPermission('batches', 'read'), getAllBatches);
router.post("/", authenticate, checkPermission('batches', 'create'), createBatch);
router.get("/:id", authenticate, checkPermission('batches', 'read'), getBatchById);
router.put("/:id", authenticate, checkPermission('batches', 'update'), checkStudentsAssignedToBatch, updateBatch);
router.delete("/:id", authenticate, checkPermission('batches', 'delete'), checkStudentsAssignedToBatch, deleteBatch);
router.get('/course/:courseId', authenticate, checkPermission('batches', 'read'), getBatchesByCourseId);

// Define other routes

module.exports = router;
