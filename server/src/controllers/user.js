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
    const { name, password, email, user_type } = req.body;

    // Check if user_type exists in the user_type collection
    const user_type_document = await User_type.findOne({ name: user_type });

    if (!user_type_document) {
      return res.status(400).json({
        success: false,
        message: `User type not found: ${user_type}`,
      });
    }

    // Check if the email already exists
    const userAvailable = await User.findOne({ email });

    if (userAvailable) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
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

    // Save user
    const newUser = await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        user_type: user_type_document.name,
      },
    });
  } catch (error) {
    console.error(error); // log for debugging

    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email and populate user_type
    const user = await User.findOne({ email }).populate({
      path: "user_type",
      model: "User_type",
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check user status
    if (!user.status) {
      return res.status(403).json({
        success: false,
        message: "Permission denied. Please contact admin.",
      });
    }

    // Prepare user info for token payload
    const { _id, name: userName, email: userEmail, user_type: userType } = user;

    // Construct permissions object from userType document
    const permissions = {
      user: userType.user,
      student: userType.student,
      course: userType.course,
      batch: userType.batch,
      registrations: userType.registrations,
    };

    // Create JWT token
    const token = jwt.sign(
      {
        userId: _id,
        userName,
        userEmail,
        userType, // include full userType object here
        permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Respond with expected structure
    res.status(200).json({
      message: "Login successful",
      token,
      permissions, // at root level
      userId: _id,
      userName,
      userEmail,
      userType, // full userType object
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
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
