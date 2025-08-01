const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const config = require('../config');

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'development' ? 50 : 10, // Stricter for auth
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting for other routes
const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware setup
const securityMiddleware = (app) => {
  // Set security headers
  app.use(helmet());
  
  // Apply stricter rate limiting to auth routes
  app.use('/api/auth', authLimiter);
  
  // Apply general rate limiting to other routes
  app.use('/api', generalLimiter);
  
  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};

module.exports = securityMiddleware; 