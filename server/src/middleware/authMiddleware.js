require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user"); 

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (optional but recommended)
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user to request object for later use
    req.user = user;

    // Example of an extra condition:
    // If you want to restrict only active users
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "User is blocked",
      });
    }

    // Continue to next middleware/route handler
    next();

  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
}

module.exports = authenticate;
