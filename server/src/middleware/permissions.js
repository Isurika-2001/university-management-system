const checkPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      // Check if user exists and has permissions
      if (!req.user || !req.user.permissions) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No permissions found'
        });
      }

      // Check if user has permissions for the specific resource
      const resourcePermissions = req.user.permissions[resource];
      if (!resourcePermissions) {
        return res.status(403).json({
          success: false,
          message: `Access denied: No permissions for ${resource}`
        });
      }

      // Check if user has the required action permission
      if (!resourcePermissions.includes(action)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Insufficient permissions for ${action} on ${resource}`
        });
      }

      // Permission granted, continue to next middleware
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};

module.exports = {
  checkPermission
};
