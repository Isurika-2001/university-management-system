// Import any necessary modules or dependencies
const Batch = require("../models/batch");

// Define an async function to get all batches
async function getAllBatches(req, res) {
  try {
    const batches = await Batch.find().populate('courseId', 'name');

    // Map course.name for each batch and add as courseName
    const formattedBatches = batches.map(batch => ({
      _id: batch._id,
      name: batch.name,
      courseId: batch.courseId?._id || null,
      courseName: batch.courseId?.name || null,
    }));

    res.status(200).json(formattedBatches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Define an async function to get batches for a selected courseId
async function getBatchesByCourseId(req, res) {
  const { courseId } = req.params;

  try {
    const batches = await Batch.find({ courseId }).populate('courseId', 'name');

    // Map course.name for each batch and add as courseName
    const formattedBatches = batches.map(batch => ({
      _id: batch._id,
      name: batch.name,
      courseId: batch.courseId?._id || null,
      courseName: batch.courseId?.name || null,
    }));

    res.status(200).json(formattedBatches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createBatch(req, res) {
  const { courseId, year, number } = req.body;

  const name = `${year}.${number}`;

  try {
    // Check for duplicate batch within the same course
    if (await checkDuplicateBatch(courseId, name)) {
      return res.status(403).json({
        success: false,
        message: "Batch name already exists for this course",
      });
    }

    const batch = new Batch({ courseId, name });
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

// updated checkDuplicateBatch to include courseId
async function checkDuplicateBatch(courseId, name) {
  const batch = await Batch.findOne({ courseId, name });
  return !!batch;
}

// Export the functions to make them accessible from other files
module.exports = {
  getAllBatches,
  createBatch,
  getBatchesByCourseId,
};
