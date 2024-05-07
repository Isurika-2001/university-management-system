const mongoose = require("mongoose");

// Import the required modules

// Define the course schema
const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Create the course model
const Course = mongoose.model("Course", courseSchema);

// Export the course model
module.exports = Course;
