const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const router = express.Router();

const User = require('../models/User');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { handleValidationErrors } = require('../middleware/validation');
const logger = require('../utils/logger');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public (but should be restricted in production)
router.post('/register', [
  body('personalInfo.name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('personalInfo.email').isEmail().withMessage('Valid email is required'),
  body('employeeId').trim().isLength({ min: 3 }).withMessage('Employee ID is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('workInfo.role').isIn(['MR', 'Admin', 'Manager']).withMessage('Valid role is required'),
  handleValidationErrors
], catchAsync(async (req, res) => {
  const { personalInfo, employeeId, password, workInfo } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { 'personalInfo.email': personalInfo.email },
      { employeeId }
    ]
  });

  if (existingUser) {
    throw new AppError('User with this email or employee ID already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = new User({
    personalInfo,
    employeeId,
    password: hashedPassword,
    workInfo,
    firebaseUid: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  logger.info(`New user registered: ${personalInfo.email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: {
        id: user._id,
        name: user.personalInfo.name,
        email: user.personalInfo.email,
        role: user.workInfo.role,
        employeeId: user.employeeId
      }
    }
  });
}));

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required'),
  handleValidationErrors
], catchAsync(async (req, res) => {
  const { email, password, role } = req.body;

  // Find user by email
  const user = await User.findOne({ 'personalInfo.email': email }).select('+password');

  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials or inactive account', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check role if specified
  if (role && user.workInfo.role.toLowerCase() !== role.toLowerCase()) {
    throw new AppError(`This account is not registered as ${role}`, 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.personalInfo.name,
        email: user.personalInfo.email,
        role: user.workInfo.role,
        employeeId: user.employeeId,
        territory: user.workInfo.territory,
        region: user.workInfo.region
      }
    }
  });
}));

// @route   POST /api/v1/auth/firebase-login
// @desc    Login with Firebase UID (existing functionality)
// @access  Public
router.post('/firebase-login', [
  body('firebaseUid').exists().withMessage('Firebase UID is required'),
  handleValidationErrors
], catchAsync(async (req, res) => {
  const { firebaseUid, role } = req.body;

  const user = await User.findOne({ firebaseUid });

  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 404);
  }

  // Check role if specified
  if (role && user.workInfo.role.toLowerCase() !== role.toLowerCase()) {
    throw new AppError(`This account is not registered as ${role}`, 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.personalInfo.name,
        email: user.personalInfo.email,
        role: user.workInfo.role,
        employeeId: user.employeeId,
        firebaseUid: user.firebaseUid
      }
    }
  });
}));

// @route   POST /api/v1/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', catchAsync(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new AppError('Invalid user', 401);
    }

    const newToken = generateToken(user._id);

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
}));

module.exports = router;