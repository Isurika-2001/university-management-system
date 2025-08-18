const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
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
    enrollment_no: {
      type: String,
      required: true,
      unique: true,
    },
    // New fields
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    // Batch transfer tracking
    batchTransfers: [{
      batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      reason: {
        type: String,
        required: true,
      },
    }],
  },
  {
    timestamps: true, 
  }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;
