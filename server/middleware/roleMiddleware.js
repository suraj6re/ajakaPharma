const ApiResponse = require('../utils/apiResponse');

/**
 * Check if user is Admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Authentication required');
  }

  const userRole = req.user.workInfo?.role || req.user.role;
  
  if (userRole?.toLowerCase() !== 'admin') {
    return ApiResponse.forbidden(res, 'Access denied. Admin privileges required.');
  }

  next();
};

/**
 * Check if user is MR
 */
const isMR = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Authentication required');
  }

  const userRole = req.user.workInfo?.role || req.user.role;
  
  if (userRole?.toLowerCase() !== 'mr') {
    return ApiResponse.forbidden(res, 'Access denied. MR privileges required.');
  }

  next();
};

/**
 * Check if user is either Admin or MR
 */
const isAdminOrMR = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Authentication required');
  }

  const userRole = req.user.workInfo?.role || req.user.role;
  const role = userRole?.toLowerCase();
  
  if (role !== 'admin' && role !== 'mr') {
    return ApiResponse.forbidden(res, 'Access denied. Admin or MR privileges required.');
  }

  next();
};

/**
 * Check if user owns the resource or is admin
 * Usage: isOwnerOrAdmin('mr') - checks if req.params.id matches req.user._id or user is admin
 */
const isOwnerOrAdmin = (ownerField = 'mr') => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const userRole = req.user.workInfo?.role || req.user.role;
    const isAdmin = userRole?.toLowerCase() === 'admin';
    
    // Admin can access everything
    if (isAdmin) {
      return next();
    }

    // Check if user owns the resource
    const resourceOwnerId = req.params.id || req.body[ownerField];
    
    if (resourceOwnerId && resourceOwnerId.toString() !== req.user._id.toString()) {
      return ApiResponse.forbidden(res, 'Access denied. You can only access your own resources.');
    }

    next();
  };
};

module.exports = {
  isAdmin,
  isMR,
  isAdminOrMR,
  isOwnerOrAdmin
};
