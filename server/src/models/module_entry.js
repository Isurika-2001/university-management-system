const mongoose = require('mongoose');

const moduleEntrySchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Ensure a module name is unique per course
moduleEntrySchema.index({ courseId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('ModuleEntry', moduleEntrySchema);
