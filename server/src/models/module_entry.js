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
    },
    isSequential: {
      type: Boolean,
      default: false
    },
    sequenceNumber: {
      type: Number,
      default: null,
      validate: {
        validator: function(value) {
          // If isSequential is true, sequenceNumber must be a positive integer
          // If isSequential is false, sequenceNumber should be null
          if (this.isSequential) {
            return value !== null && Number.isInteger(value) && value > 0;
          }
          return value === null;
        },
        message: 'Sequence number must be a positive integer when isSequential is true'
      }
    }
  },
  { timestamps: true }
);

// Ensure a module name is unique per course
moduleEntrySchema.index({ courseId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('ModuleEntry', moduleEntrySchema);
