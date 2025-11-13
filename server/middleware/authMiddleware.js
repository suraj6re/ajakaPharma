const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');
const User = require('../models/User');

/**
 * JWT Authentication middleware
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'No token provided. Please login.');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return ApiResponse.unauthorized(res, 'User not found.');
      }

      if (!user.isActive) {
        return ApiResponse.forbidden(res, 'Your account has been deactivated.');
      }

      // Attach user to request
      req.user = user;
      
      next();
    } catch (jwtError) {
      return ApiResponse.unauthorized(res, 'Invalid or expired token.');
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    return ApiResponse.unauthorized(res, 'Authentication failed.');
  }
};

module.exports = authMiddleware;
