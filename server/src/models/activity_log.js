const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'STUDENT_CREATE',
      'STUDENT_UPDATE',
      'STUDENT_DELETE',
      'STUDENT_EXPORT',
      'STUDENT_IMPORT',
      'COURSE_REGISTRATION_CREATE',
      'COURSE_REGISTRATION_UPDATE',
      'COURSE_REGISTRATION_DELETE',
      'COURSE_REGISTRATION_EXPORT',
      'BULK_UPLOAD_STUDENTS',
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_DISABLE'
    ]
  },
  description: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['STUDENT', 'COURSE_REGISTRATION', 'USER', 'AUTH', 'BULK_UPLOAD']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceType'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING'],
    default: 'SUCCESS'
  },
  errorMessage: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema); 