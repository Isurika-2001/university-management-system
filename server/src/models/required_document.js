const mongoose = require("mongoose");

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
}, {
  timestamps: true,
});

const RequiredDocument = mongoose.model("RequiredDocument", requiredDocumentSchema);

module.exports = RequiredDocument;
