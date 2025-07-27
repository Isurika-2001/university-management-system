// batchRoutes.js

const express = require("express");
const { getAllBatches, createBatch, getBatchesByCourseId, deleteBatch } = require("../controllers/batch");

const router = express.Router();

router.get("/", getAllBatches);
router.post("/", createBatch);
router.delete("/:id", deleteBatch);
router.get('/course/:courseId', getBatchesByCourseId);

// Define other routes

module.exports = router;
