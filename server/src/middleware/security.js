const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const config = require('../config');

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'development' ? 1000 : 10, // Much more lenient in development
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
  max: config.nodeEnv === 'development' ? 2000 : config.rateLimitMax, // Much more lenient in development
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
  
  // Only apply rate limiting in production
  if (config.nodeEnv === 'production') {
    // Apply stricter rate limiting to auth routes
    app.use('/api/auth', authLimiter);
    
    // Apply general rate limiting to other routes
    app.use('/api', generalLimiter);
  } else {
    // In development, just log rate limiting info
    app.use('/api/auth', (req, res, next) => {
      console.log(`[DEV] Auth request: ${req.method} ${req.path}`);
      next();
    });
    
    app.use('/api', (req, res, next) => {
      console.log(`[DEV] API request: ${req.method} ${req.path}`);
      next();
    });
  }
  
  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};

module.exports = securityMiddleware; 