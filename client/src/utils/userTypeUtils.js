/**
 * User Type Name Conversion Utilities
 * Converts database user type names to display-friendly names
 */

// Mapping of database names to display names
const USER_TYPE_DISPLAY_NAMES = {
  system_administrator: 'System Administrator',
  academic_administrator: 'Academic Administrator',
  finance_admin: 'Finance Administrator',
  accountant: 'Accountant',
  sup_admin: 'Super Admin',
  admin: 'Admin',
  counselor: 'Counselor',
  student: 'Student'
  // Add more mappings as needed
};

/**
 * Convert a user type name from database format to display format
 * @param {string} userTypeName - The user type name from database
 * @returns {string} - The display-friendly name
 */
export const formatUserTypeName = (userTypeName) => {
  if (!userTypeName) return '';

  const normalizedName = userTypeName.toLowerCase().trim();
  return USER_TYPE_DISPLAY_NAMES[normalizedName] || userTypeName;
};

/**
 * Convert an array of user types to include display names
 * @param {Array} userTypes - Array of user type objects from API
 * @returns {Array} - Array with display names added
 */
export const formatUserTypes = (userTypes) => {
  if (!Array.isArray(userTypes)) return [];

  return userTypes.map((userType) => ({
    ...userType,
    displayName: formatUserTypeName(userType.name)
  }));
};

/**
 * Convert a single user type object to include display name
 * @param {Object} userType - User type object from API
 * @returns {Object} - User type object with display name added
 */
export const formatUserType = (userType) => {
  if (!userType) return null;

  return {
    ...userType,
    displayName: formatUserTypeName(userType.name)
  };
};

/**
 * Get all available display names for user types
 * @returns {Array} - Array of display names
 */
export const getDisplayNames = () => {
  return Object.values(USER_TYPE_DISPLAY_NAMES);
};

/**
 * Get the display name for a specific user type by its database name
 * @param {string} userTypeName - The database user type name
 * @returns {string} - The display name
 */
export const getDisplayName = (userTypeName) => {
  return formatUserTypeName(userTypeName);
};

/**
 * Check if user has permission for a specific action
 * @param {Object} user - User object with userType and permissions
 * @param {string} resource - Resource name (user, student, course, batch, enrollments, finance, reports)
 * @param {string} action - Action type (C, R, U, D)
 * @returns {boolean} - Whether user has permission
 */
export const hasPermission = (user, resource, action) => {
  if (!user) return false;

  // Try common locations for permissions
  let permissions = undefined;
  if (user.permissions && user.permissions[resource] !== undefined) permissions = user.permissions[resource];
  else if (user.userType && user.userType[resource] !== undefined) permissions = user.userType[resource];
  else if (user.user_type && user.user_type[resource] !== undefined) permissions = user.user_type[resource];

  if (permissions === undefined || permissions === null) return false;

  // If it's an array
  if (Array.isArray(permissions)) return permissions.includes(action);

  // If it's a string like 'CRUD'
  if (typeof permissions === 'string') return permissions.includes(action);

  // If it's an object, try to extract string-ish values and check
  if (typeof permissions === 'object') {
    const joined = Object.values(permissions).filter(Boolean).join('');
    return joined.includes(action);
  }

  return false;
};

/**
 * Get user role display name
 * @param {Object} user - User object
 * @returns {string} - Display name of user role
 */
export const getUserRoleDisplayName = (user) => {
  if (!user || !user.userType) return 'Unknown';
  return formatUserTypeName(user.userType.name);
};

export default {
  formatUserTypeName,
  formatUserTypes,
  formatUserType,
  getDisplayNames,
  getDisplayName,
  hasPermission,
  getUserRoleDisplayName
};
