require('dotenv').config();
const User = require('../models/user');
const User_type = require('../models/user_type');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ActivityLogger = require('../utils/activityLogger');
const { getRequestInfo } = require('../middleware/requestInfo');

/**
 * Helper: Returns the current JWT version. This should be set in your environment
 * and manually incremented (e.g., after a server update, set JWT_VERSION=2, etc.)
 * All newly issued tokens will include the current version. If you want to force
 * logout of users after a release, increment JWT_VERSION and redeploy/rebuild.
 */
function getJwtVersion() {
  // fallback 1 if not set
  return process.env.JWT_VERSION ? Number(process.env.JWT_VERSION) : 1;
}

async function getUsers(req, res) {
  // fetch users with optional status filter and user_type populated
  try {
    const { status } = req.query;
    const filter = {};

    if (status === 'active') {
      filter.status = true;
    } else if (status === 'disabled') {
      filter.status = false;
    }

    const users = await User.find(filter).populate({
      path: 'user_type',
      model: 'User_type',
    });
    res.status(200).json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}

async function createUser(req, res) {
  try {
    const { name, password, email, user_type } = req.body;
    const requestInfo = getRequestInfo(req);

    // Check if user_type exists in the user_type collection
    const user_type_document = await User_type.findById(user_type);

    if (!user_type_document) {
      return res.status(400).json({
        success: false,
        message: `User type not found with ID: ${user_type}`,
        error: 'User type not found'
      });
    }

    // Check if the email already exists
    const userAvailable = await User.findOne({ email });

    if (userAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
        error: 'Email already exists'
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

    // Log the user creation
    await ActivityLogger.logUserCreate(req.user, newUser, requestInfo.ipAddress, requestInfo.userAgent);

    // Populate the user_type for the response
    const populatedUser = await User.findById(newUser._id).populate({
      path: 'user_type',
      model: 'User_type',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: populatedUser,
    });
  } catch (error) {
    console.error(error); // log for debugging

    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
}

/**
 * JWT tokens now include a version (jwtVersion).
 * After you set JWT_VERSION=2 (or higher) and rebuild/redeploy the app,
 * all previous tokens (signed with older version) will become invalid
 * whenever you start checking it in frontend or backend.
 *
 * To force users to relogin after update/maintenance:
 *   1. Increment JWT_VERSION in your environment (e.g., .env file or server config)
 *   2. Rebuild and redeploy (Vercel, or any server)
 *   3. In frontend, on API error (401/403 or specific token version mismatch), force logout.
 *   4. Optionally, on backend protected routes, verify token version and reject old ones.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const requestInfo = getRequestInfo(req);

    // Find user by email and populate user_type
    const user = await User.findOne({ email }).populate({
      path: 'user_type',
      model: 'User_type',
    });

    if (!user) {
      // Log failed login attempt
      await ActivityLogger.logLogin({ email }, requestInfo.ipAddress, requestInfo.userAgent, 'FAILED', 'Invalid email');
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Log failed login attempt
      await ActivityLogger.logLogin(user, requestInfo.ipAddress, requestInfo.userAgent, 'FAILED', 'Invalid password');
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check user status
    if (!user.status) {
      // Log failed login attempt
      await ActivityLogger.logLogin(user, requestInfo.ipAddress, requestInfo.userAgent, 'FAILED', 'User disabled');
      
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Please contact admin.',
      });
    }

    // Check if user type exists
    if (!user.user_type) {
      // Log failed login attempt
      await ActivityLogger.logLogin(user, requestInfo.ipAddress, requestInfo.userAgent, 'FAILED', 'User type not found');
      
      return res.status(403).json({
        success: false,
        message: 'User type not configured. Please contact admin.',
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
      enrollments: userType.enrollments,
      finance: userType.finance,
      reports: userType.reports,
      requiredDocument: userType.requiredDocument,
      classrooms: userType.classrooms,
      modules: userType.modules,
      exams: userType.exams
    };

    // Include jwtVersion in payload
    const jwtVersion = getJwtVersion();

    // Create JWT token
    const token = jwt.sign(
      {
        userId: _id,
        userName,
        userEmail,
        userType, // include full userType object here
        permissions,
        jwtVersion
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Log successful login
    await ActivityLogger.logLogin(user, requestInfo.ipAddress, requestInfo.userAgent);

    // Respond with expected structure (including jwtVersion for client awareness)
    res.status(200).json({
      message: 'Login successful',
      token,
      permissions, // at root level
      userId: _id,
      userName,
      userEmail,
      userType, // full userType object
      jwtVersion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    // check if the id is valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid id',
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findById(id).populate({
      path: 'user_type',
      model: 'User_type',
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}

async function editUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, user_type } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User not found'
      });
    }

    // Check if user_type exists
    const userTypeDoc = await User_type.findById(user_type);
    if (!userTypeDoc) {
      return res.status(400).json({
        success: false,
        message: `User type not found with ID: ${user_type}`,
        error: 'User type not found'
      });
    }

    // If email is changing, check for duplication
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists',
          error: 'Email already exists'
        });
      }
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.user_type = userTypeDoc._id;

    const updatedUser = await user.save();

    // Populate the user_type for the response
    const populatedUser = await User.findById(updatedUser._id).populate({
      path: 'user_type',
      model: 'User_type',
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: populatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
}

async function disableUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User not found'
      });
    }

    user.status = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User disabled successfully',
      data: {
        userId: user._id,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error disabling user:', error);
    res.status(500).json({
      success: false,
      message: 'Error disabling user',
      error: error.message,
    });
  }
}

async function updatePassword(req, res) {
  try {
    const { id } = req.params;
    const { password, confirmPassword } = req.body;

    // Validate required fields
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password are required',
        error: 'Missing required fields'
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        error: 'Password mismatch'
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User not found'
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User password updated successfully',
      data: {
        userId: user._id,
        message: 'Password updated successfully'
      }
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
}

async function enableUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User not found'
      });
    }

    user.status = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User enabled successfully',
      data: {
        userId: user._id,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error enabling user:', error);
    res.status(500).json({
      success: false,
      message: 'Error enabling user',
      error: error.message,
    });
  }
}

module.exports = {
  getUsers,
  createUser,
  login,
  getUserById,
  editUser,
  disableUser,
  updatePassword,
  enableUser
};
