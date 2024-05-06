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

  const batch = new Batch({
    name,
  });

  try {
    const newBatch = await batch.save();
    res.status(201).json(newBatch);
  } catch (error) {
    if (error.code === 11000) { 
      res.status(400).json({ error: "Batch name already exist" });
    } else {
      res.status(400).json({ error: "Error creating batch" });
    }
  }
}

// Export the functions to make them accessible from other files
module.exports = {
  getAllBatches,
  createBatch,
};
