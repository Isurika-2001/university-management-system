// batchRoutes.js

const express = require("express");
const { getAllBatches, createBatch } = require("../controllers/batch");

const router = express.Router();

router.get("/batches", getAllBatches);
router.post("/batch", createBatch);

// Define other routes

module.exports = router;
