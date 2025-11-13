const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: '../.env' });

const connectDB = require('./db');
const logger = require('./utils/logger');
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');

// Connect to MongoDB
logger.info('Starting server...');
connectDB(process.env.MONGODB_URI);

const app = express();

// CORS configuration - MUST be before other middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware (after CORS)
app.use(helmet({
  crossOriginResourcePolicy: false, // Disable to allow CORS
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// NEW API ROUTES - Production Ready Backend
// ============================================
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/visit-reports', require('./routes/visitReportRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/mr-targets', require('./routes/mrTargetRoutes'));
app.use('/api/mr-performance', require('./routes/mrPerformanceRoutes'));
app.use('/api/product-activity', require('./routes/productActivityRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));

// ============================================
// All routes are now handled by route modules above
// Legacy routes have been replaced with new controllers
// ============================================

// Handle 404 errors
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
