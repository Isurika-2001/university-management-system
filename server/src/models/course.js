const mongoose = require("mongoose");

// Import the required modules

// Define the course schema
const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  // New fields
  prerequisites: {
    type: String,
    default: "None",
  },
  courseCredits: {
    type: Number,
    required: true,
    min: 1,
  },
  courseDuration: {
    type: String,
    required: true,
    enum: [
      '6 months',
      '9 months',
      '12 months',
      '15 months',
      '18 months',
      '24 months'
    ],
  },
  weekdayBatch: {
    type: Boolean,
    default: false,
  },
  weekendBatch: {
    type: Boolean,
    default: false,
  },
});

// Create the course model
const Course = mongoose.model("Course", courseSchema);

// Export the course model
module.exports = Course;
