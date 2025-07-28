// batchRoutes.js

const express = require("express");
const { getAllBatches, createBatch, getBatchesByCourseId, deleteBatch, getBatchById, updateBatch } = require("../controllers/batch");

// middleware calling
const { checkStudentsAssignedToBatch } = require("../middleware/studentMiddleware");

const router = express.Router();

router.get("/", getAllBatches);
router.post("/", createBatch);
router.get("/:id", getBatchById);
router.put("/:id", checkStudentsAssignedToBatch, updateBatch);
router.delete("/:id", checkStudentsAssignedToBatch, deleteBatch);
router.get('/course/:courseId', getBatchesByCourseId);

// Define other routes

module.exports = router;
