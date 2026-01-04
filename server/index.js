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
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = Array.isArray(config.corsOrigin) 
      ? config.corsOrigin 
      : [config.corsOrigin];
    
    if (allowedOrigins.indexOf(origin) !== -1 || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type'],
  credentials: true, // Required for cookies
  exposedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));

// Cookie parser middleware (must come before routes)
app.use(cookieParser());

// Security middleware (after CORS)
securityMiddleware(app);

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

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
    
    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
