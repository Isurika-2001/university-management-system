const mongoose = require('mongoose');
const { STATUSES } = require('../config/statuses');

const classroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ModuleEntry'
    },
    moduleName: {
      type: String
    },
    month: {
      type: String,
      required: true
    },
    capacity: {
      type: Number,
      default: 50
    },
    description: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Classroom', classroomSchema);
