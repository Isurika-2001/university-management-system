// batchRoutes.js

const express = require("express");
const { getAllBatches, createBatch, getBatchesByCourseId } = require("../controllers/batch");

const router = express.Router();

router.get("/batches", getAllBatches);
router.post("/batch", createBatch);
router.get('/batches/course/:courseId', getBatchesByCourseId);

// Define other routes

module.exports = router;
