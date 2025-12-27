const mongoose = require('mongoose');

const requiredDocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['academic', 'identity', 'financial', 'medical', 'other']
  },
  isRequired: {
    type: Boolean,
    default: true,
    required: true
  }
}, {
  timestamps: true,
});

const RequiredDocument = mongoose.model('RequiredDocument', requiredDocumentSchema);

module.exports = RequiredDocument;
