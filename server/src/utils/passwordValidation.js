/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      message: 'Password is required'
    };
  }

  // Minimum length
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  // Maximum length to prevent DoS
  if (password.length > 128) {
    return {
      valid: false,
      message: 'Password must be less than 128 characters'
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number'
    };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character'
    };
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'letmein', 'welcome', 'admin', '1234567890'
  ];
  
  if (commonPasswords.some(weak => password.toLowerCase().includes(weak))) {
    return {
      valid: false,
      message: 'Password is too common. Please choose a stronger password'
    };
  }

  return {
    valid: true,
    message: 'Password is valid'
  };
}

module.exports = {
  validatePasswordStrength
};

