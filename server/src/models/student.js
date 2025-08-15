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
  registration_no: {
    type: String,
    required: true,
    unique: true,
  },
  // Student status
  status: {
    type: String,
    enum: ['pending', 'completed', 'incomplete'],
    default: 'pending'
  },
  // Step 1: Registration data
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  // Step 2: Academic and document information (Optional)
  highestAcademicQualification: {
    type: String,
    enum: [
      'O-Level',
      'A-Level',
      'Diploma',
      'Bachelor\'s Degree',
      'Master\'s Degree',
      'PhD',
      'Other'
    ],
    required: false,
  },
  qualificationDescription: {
    type: String,
    required: false,
  },
  // Required documents status
  requiredDocuments: [{
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RequiredDocument",
    },
    isProvided: {
      type: Boolean,
      default: false,
    },
  }],
  // Emergency contact details (Optional)
  emergencyContact: {
    name: {
      type: String,
      required: false,
    },
    relationship: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    email: String,
    address: String,
  },
}, {
  timestamps: true,
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
