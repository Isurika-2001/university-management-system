require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function authenticate(req, res, next) {
  try {
    // Get token from HttpOnly cookie only (most secure approach)
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login again.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 💠 Compare token version with current server version
    const currentVersion = process.env.JWT_VERSION
      ? Number(process.env.JWT_VERSION)
      : 1;

    if (!decoded.jwtVersion || decoded.jwtVersion !== currentVersion) {
      return res.status(401).json({
        success: false,
        message:
          'Token version mismatch. Please login again after system update.',
        code: 'TOKEN_VERSION_MISMATCH',
        expectedVersion: currentVersion,
        tokenVersion: decoded.jwtVersion || null,
      });
    }

    // Fetch user from DB
    const user = await User.findById(decoded.userId).populate('user_type');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Attach user and permissions
    req.user = user;
    if (user.user_type) {
      req.user.permissions = user.user_type;
    }

    // Restrict blocked users
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'User is blocked',
      });
    }

    next();
  } catch (error) {
    // console.error('Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
}

module.exports = authenticate;
