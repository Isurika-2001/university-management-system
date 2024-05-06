const mongoose = require("mongoose");

// Import the required modules

// Define the schema for the Batch model
const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

// Create the Batch model using the schema
const Batch = mongoose.model("Batch", batchSchema);

// Export the Batch model
module.exports = Batch;
