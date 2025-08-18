const mongoose = require('mongoose');

const requiredDocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['academic', 'personal', 'financial', 'medical', 'legal', 'other']
  },
  isRequired: {
    type: Boolean,
    required: true,
    default: true
  },
  maxFileSize: {
    type: Number,
    required: true,
    min: 1,
    max: 50,
    default: 5
  },
  allowedExtensions: {
    type: [String],
    required: true,
    default: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better search performance
requiredDocumentSchema.index({ name: 1 });
requiredDocumentSchema.index({ type: 1 });

module.exports = mongoose.model('RequiredDocument', requiredDocumentSchema);
