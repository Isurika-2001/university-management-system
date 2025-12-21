const mongoose = require('mongoose');

const takeSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'fresh' },
    mark: { type: Number, required: true },
    passed: { type: Boolean, required: true }
  },
  { timestamps: true }
);

const examMarkSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    takes: [takeSchema]
  },
  { timestamps: true }
);

examMarkSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ExamMark', examMarkSchema);
