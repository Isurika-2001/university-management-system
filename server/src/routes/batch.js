// batchRoutes.js

const express = require("express");
const { getAllBatches, createBatch, getBatchesByCourseId } = require("../controllers/batch");

const router = express.Router();

router.get("/", getAllBatches);
router.post("/", createBatch);
router.get('/course/:courseId', getBatchesByCourseId);

// Define other routes

module.exports = router;
