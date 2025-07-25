const mongoose = require("mongoose");

// Import the required modules

// Define the schema for the Batch model
const batchSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

// Create the Batch model using the schema
const Batch = mongoose.model("Batch", batchSchema);

// Export the Batch model
module.exports = Batch;
