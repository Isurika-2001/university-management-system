const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String,
  user_type: { type: mongoose.Schema.Types.ObjectId, ref: "User_type" },
  status: { type: Boolean, default: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
