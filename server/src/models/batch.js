const mongoose = require("mongoose");

// Define the schema for the Intake (Batch) model
const batchSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  name: {
    // term (e.g., B11, B12)
    type: String,
    required: true,
  },
  orientationDate: {
    type: Date,
    required: false, // Set to true if it's mandatory
  },
  startDate: {
    type: Date,
    required: false,
  },
  registrationDeadline: {
    type: Date,
    required: false,
  }
});

// Create the Batch model using the schema
const Batch = mongoose.model("Batch", batchSchema);

// Export the Batch model
module.exports = Batch;
