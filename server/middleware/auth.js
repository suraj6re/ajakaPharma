const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or inactive user' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.workInfo?.role || req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Middleware to check if user can access specific MR data
const authorizeMRAccess = async (req, res, next) => {
  try {
    const userRole = req.user.workInfo?.role || req.user.role;
    const requestedMRId = req.params.mrId || req.body.mr || req.query.mrId;

    // Admin can access all MR data
    if (userRole === 'Admin') {
      return next();
    }

    // MR can only access their own data
    if (userRole === 'MR') {
      if (requestedMRId && requestedMRId !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. You can only access your own data.' 
        });
      }
      // If no specific MR ID requested, set it to current user
      if (!requestedMRId) {
        req.params.mrId = req.user._id.toString();
        req.body.mr = req.user._id;
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Authorization check failed' 
    });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeMRAccess
};