const mongoose = require('mongoose');
const { STATUSES } = require('../config/statuses');

const classroomStudentSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true
    },
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.ACTIVE
    }
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate entries
classroomStudentSchema.index({ classroomId: 1, enrollmentId: 1 }, { unique: true });

module.exports = mongoose.model('ClassroomStudent', classroomStudentSchema);
