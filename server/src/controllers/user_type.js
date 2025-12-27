const User_type = require('../models/user_type');

async function getUser_types(req, res) {
  try {
    const user_types = await User_type.find();
    res.status(200).json({
      success: true,
      data: user_types,
      message: 'User types retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user types:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}
module.exports = {
  getUser_types,
};
