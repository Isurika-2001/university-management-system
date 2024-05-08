const mongoose = require("mongoose");

const user_typeSchema = new mongoose.Schema({
  name: String,
  user: String,
  student: String,
  course: String,
  batch: String,
  registrations: String,
});

const User_type = mongoose.model("User_type", user_typeSchema);

module.exports = User_type;
