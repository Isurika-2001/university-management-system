// Import any necessary modules or dependencies
const Batch = require("../models/batch");

// Define an async function to get all batches
async function getAllBatches(req, res) {
  try {
    const batches = await Batch.find();
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createBatch(req, res) {
  const { year, number } = req.body;

  const name = `${year}.${number}`;

  try {
    // Check for duplicate batch
    if (await checkDuplicateBatch(name)) {
      return res.status(403).json({
        success: false,
        message: "Batch name already exists",
      });
    }

    const batch = new Batch({ name });
    const newBatch = await batch.save();

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: newBatch,
    });
  } catch (error) {
    console.error(error); // log for debugging

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Batch name already exists (duplicate key error)",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error creating batch",
        error: error.message, // optional detailed error for debugging
      });
    }
  }
}

// seperate function for check the batch name is already exist or not
async function checkDuplicateBatch(name) {
  const batch = await Batch.findOne({ name });
  return batch ? true : false;
}

// Export the functions to make them accessible from other files
module.exports = {
  getAllBatches,
  createBatch,
};
