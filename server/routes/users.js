const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateUserCreation, validatePagination, validateObjectId } = require('../middleware/validation');
const { catchAsync, AppError } = require('../middleware/errorHandler');

// @route   GET /api/v1/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', 
  authenticateToken, 
  authorizeRoles('Admin'), 
  validatePagination,
  catchAsync(async (req, res) => {
    const { page = 1, limit = 10, role, region, isActive } = req.query;
    
    // Build filter object
    const filter = {};
    if (role) filter['workInfo.role'] = role;
    if (region) filter['workInfo.region'] = region;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-firebaseUid -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('workInfo.reportingManager', 'personalInfo.name employeeId'),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  })
);

// @route   GET /api/v1/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', 
  authenticateToken,
  catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
      .select('-firebaseUid -__v')
      .populate('workInfo.reportingManager', 'personalInfo.name employeeId');

    res.json({
      success: true,
      data: { user }
    });
  })
);

// @route   PUT /api/v1/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', 
  authenticateToken,
  catchAsync(async (req, res) => {
    const allowedUpdates = [
      'personalInfo.name',
      'personalInfo.phone',
      'personalInfo.profilePicture',
      'workInfo.territory',
      'workInfo.city'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-firebaseUid -__v');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  })
);

// @route   GET /api/v1/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private/Admin
router.get('/:id', 
  authenticateToken, 
  authorizeRoles('Admin'),
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id)
      .select('-firebaseUid -__v')
      .populate('workInfo.reportingManager', 'personalInfo.name employeeId');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user }
    });
  })
);

// @route   PUT /api/v1/users/:id
// @desc    Update user by ID (Admin only)
// @access  Private/Admin
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('Admin'),
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-firebaseUid -__v');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  })
);

// @route   DELETE /api/v1/users/:id
// @desc    Deactivate user (Admin only)
// @access  Private/Admin
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Admin'),
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  })
);

// @route   GET /api/v1/users/by-uid/:uid
// @desc    Get user by Firebase UID (for backward compatibility)
// @access  Public
router.get('/by-uid/:uid', 
  catchAsync(async (req, res) => {
    const user = await User.findOne({ firebaseUid: req.params.uid })
      .select('-__v');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user
    });
  })
);

// @route   POST /api/v1/users
// @desc    Create new user (Admin only)
// @access  Private/Admin
router.post('/', 
  authenticateToken, 
  authorizeRoles('Admin'),
  validateUserCreation,
  catchAsync(async (req, res) => {
    const user = new User({
      ...req.body,
      firebaseUid: `admin-created-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });
  })
);

module.exports = router;