const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Configuration and utilities
const config = require('./src/config');
const logger = require('./src/utils/logger');
const connectToDatabase = require('./database');

// Middleware
const errorHandler = require('./src/middleware/errorHandler');
const securityMiddleware = require('./src/middleware/security');

// Routes
const routes = require('./src/routes/index');

const app = express();

app.use(compression());

// CORS configuration (must come before rate limiting)
// Note: For cookies to work, origin must be specific (not '*') and credentials must be true
const corsOptions = {
  origin: function (origin, callback) {
    // In production, be strict about origins
    if (config.nodeEnv === 'production') {
      // Allow requests with no origin (like mobile apps or curl requests) only if explicitly configured
      if (!origin) {
        // In production, reject requests without origin for security
        return callback(new Error('CORS: Origin header required'));
      }
      
      const allowedOrigins = Array.isArray(config.corsOrigin) 
        ? config.corsOrigin 
        : config.corsOrigin.split(',').map(o => o.trim());
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn(`CORS: Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, be more lenient but still log
      if (!origin) return callback(null, true);
      
      const allowedOrigins = Array.isArray(config.corsOrigin) 
        ? config.corsOrigin 
        : [config.corsOrigin];
      
      if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        logger.warn(`CORS: Allowing development request from: ${origin}`);
        callback(null, true); // Allow in dev but log
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type'],
  credentials: true, // Required for cookies
  exposedHeaders: ['Content-Type'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Cookie parser middleware (must come before routes)
app.use(cookieParser());

// Input sanitization middleware (before body parsing)
const sanitizeInput = require('./src/middleware/inputSanitizer');
app.use(sanitizeInput);

// Security middleware (after CORS)
securityMiddleware(app);

// Body parsing middleware with reasonable limits
// 5MB is sufficient for most use cases and prevents DoS attacks
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'University Management System API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API documentation route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to University Management System API',
    version: config.version,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      students: '/api/students',
      courses: '/api/courses',
      batches: '/api/batches',
      stats: '/api/stats'
    }
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectToDatabase();
    
    // Explicitly add '0.0.0.0' as the second argument
    app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
