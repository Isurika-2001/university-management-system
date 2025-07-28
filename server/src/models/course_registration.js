const mongoose = require("mongoose");

const courseRegistrationSchema = new mongoose.Schema(
  {
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
      type: String,
      required: true,
    },
    courseReg_no: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true, 
  }
);

const CourseRegistration = mongoose.model("CourseRegistration", courseRegistrationSchema);

module.exports = CourseRegistration;
