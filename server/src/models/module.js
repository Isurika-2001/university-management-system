const mongoose = require('mongoose');

// Modules are now stored per-course. Each document references a Course
// and contains the list of module names for that course.
const moduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      unique: true // one document per course
    },
    modules: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

const CourseModule = mongoose.model('CourseModule', moduleSchema);
module.exports = CourseModule;
