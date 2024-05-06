const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dob: Date,
  nic: String,
  address: String,
  mobile: String,
  homeContact: String,
  email: String,
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
    unique: true,
  },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
