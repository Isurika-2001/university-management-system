require("dotenv").config();
const User = require("../models/user");
const User_type = require("../models/user_type");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function getUsers(req, res) {
  // fetch all users with user_type populated
  try {
    const users = await User.find({ status: true }).populate({
      path: "user_type",
      model: "User_type",
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createUser(req, res) {
  try {
    const { name, password, email, user_type } =
      req.body;
    // Check if user_type exists in the user_type collection
    const user_type_document = await User_type.findOne({ name: user_type });

    if (!user_type_document) {
      return res
        .status(400)
        .json({ error: `user_type not found: ${user_type}` });
    }

    // check if the email already exists
    const userAvailable = await User.findOne({ email });

    if (userAvailable) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Assign the user_type _id and hashed password to the user before saving
    const user = new User({
      name,
      password: hashedPassword,
      email,
      user_type: user_type_document._id,
    });

    // Save and return user with success message
    await user.save();
    res.status(201).json({ user, message: "User created!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find the user with the given email and populate the 'user_type' field
    const user = await User.findOne({ email }).populate({
      path: "user_type",
      model: "User_type",
    });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // check user status is true
    if (!user.status) {
      return res
        .status(401)
        .json({ error: "Permission denied. Please contact admin." });
    }

    // Extract relevant information for the token payload
    const { _id, name: userName, email: userEmail, user_type: userType } = user;

    // Extract permissions from user_type
    const permissions = userType
      ? {
          user: userType.user,
          student: userType.student,
          course: userType.course,
          batch: userType.batch,
          course_registration: userType.course_registration,
        }
      : {};
    // Create JWT token with user information and permissions
    const token = jwt.sign(
      { userId: _id, userName, userEmail, userType, permissions },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Attach the decoded user information to the req object
    req.user = jwt.decode(token);

    // Return the token along with success message and user data
    res.status(200).json({
      message: "Login successful",
      token,
      _id,
      userName,
      userEmail,
      userType,
      permissions,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    // check if the id is valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getUsers,
  createUser,
  login,
  getUserById,
};
