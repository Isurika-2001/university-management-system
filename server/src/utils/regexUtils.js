/**
 * Escapes special regex characters in a string to prevent RegExp injection attacks
 * @param {string} str - The string to escape
 * @returns {string} - The escaped string safe for use in RegExp
 */
function escapeRegex(str) {
  if (typeof str !== 'string') {
    return '';
  }
  // Escape all special regex characters
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a safe RegExp from user input by escaping special characters
 * @param {string} searchTerm - The search term from user input
 * @param {string} flags - RegExp flags (default: 'i' for case-insensitive)
 * @returns {RegExp} - A safe RegExp object
 */
function createSafeRegex(searchTerm, flags = 'i') {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return null;
  }
  
  const escaped = escapeRegex(searchTerm.trim());
  if (!escaped) {
    return null;
  }
  
  try {
    return new RegExp(escaped, flags);
  } catch (error) {
    // If regex creation fails, return null
    return null;
  }
}

module.exports = {
  escapeRegex,
  createSafeRegex
};


