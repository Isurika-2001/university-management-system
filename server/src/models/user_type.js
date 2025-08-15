const mongoose = require("mongoose");

const user_typeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  user: String,
  student: String,
  course: String,
  batch: String,
  enrollments: String,
  finance: String,
  reports: String,
}, {
  timestamps: true,
});

const User_type = mongoose.model("User_type", user_typeSchema);

module.exports = User_type;
