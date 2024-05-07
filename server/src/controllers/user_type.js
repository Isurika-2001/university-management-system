const User_type = require("../models/user_type");

async function getUser_types(req, res) {
  try {
    const user_types = await User_type.find();
    res.status(200).json(user_types);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
module.exports = {
  getUser_types,
};
