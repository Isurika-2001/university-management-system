const mongoose = require("mongoose");

const courseRegistrationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  registration_no: {
    type: Number,
    required: true,
  },
  courseReg_no: {
    type: Number,
    required: true,
    unique: true,
  },
});

const CourseRegistration = mongoose.model("CourseRegistration", courseRegistrationSchema);

module.exports = CourseRegistration;
