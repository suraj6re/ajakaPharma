const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @desc    Login user
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return ApiResponse.badRequest(res, 'Email and password are required');
  }

  // Find user by email
  const user = await User.findOne({ email, isActive: true });
  
  if (!user) {
    return ApiResponse.unauthorized(res, 'Invalid credentials');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    return ApiResponse.unauthorized(res, 'Invalid credentials');
  }

  // Check role if specified
  if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
    return ApiResponse.forbidden(res, `This account is not registered as ${role}`);
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  ApiResponse.success(res, 'Login successful', {
    token,
    user: userResponse
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, territory, isActive, search } = req.query;
  
  // Build query
  const query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (territory) {
    query.territory = territory;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } }
    ];
  }
  
  const users = await User.find(query)
    .populate('reportingManager', 'name employeeId')
    .select('-password -__v')
    .sort({ createdAt: -1 });
  
  ApiResponse.success(res, 'Users retrieved successfully', {
    count: users.length,
    users
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Admin or Self
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('reportingManager', 'name employeeId role')
    .select('-password -__v');
  
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }
  
  // Check if user is accessing their own profile or is admin
  const isAdmin = req.user.role?.toLowerCase() === 'admin';
  const isSelf = req.user._id.toString() === user._id.toString();
  
  if (!isAdmin && !isSelf) {
    return ApiResponse.forbidden(res, 'Access denied');
  }
  
  ApiResponse.success(res, 'User retrieved successfully', user);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('reportingManager', 'name employeeId role')
    .select('-password -__v');
  
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }
  
  ApiResponse.success(res, 'Profile retrieved successfully', user);
});

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, employeeId, phone, territory, region, city, reportingManager } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email },
      { employeeId }
    ]
  });
  
  if (existingUser) {
    return ApiResponse.badRequest(res, 'User with this email or Employee ID already exists');
  }
  
  const user = await User.create({
    name,
    email,
    password,
    role,
    employeeId,
    phone,
    territory,
    region,
    city,
    reportingManager
  });
  
  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;
  
  ApiResponse.created(res, 'User created successfully', userResponse);
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Admin or Self (limited fields)
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }
  
  const isAdmin = req.user.role?.toLowerCase() === 'admin';
  const isSelf = req.user._id.toString() === user._id.toString();
  
  // If not admin and not self, deny access
  if (!isAdmin && !isSelf) {
    return ApiResponse.forbidden(res, 'Access denied');
  }
  
  // If user is updating their own profile (not admin), restrict fields
  if (isSelf && !isAdmin) {
    const allowedFields = ['phone'];
    const updates = {};
    
    if (req.body.phone) updates.phone = req.body.phone;
    
    Object.assign(user, updates);
  } else {
    // Admin can update all fields except password (use separate endpoint)
    const { name, email, role, employeeId, phone, territory, region, city, reportingManager, isActive } = req.body;
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (employeeId) user.employeeId = employeeId;
    if (phone) user.phone = phone;
    if (territory) user.territory = territory;
    if (region) user.region = region;
    if (city) user.city = city;
    if (reportingManager) user.reportingManager = reportingManager;
    if (isActive !== undefined) user.isActive = isActive;
  }
  
  await user.save();
  
  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;
  
  ApiResponse.success(res, 'User updated successfully', userResponse);
});

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }
  
  // Soft delete
  user.isActive = false;
  await user.save();
  
  ApiResponse.success(res, 'User deactivated successfully');
});

/**
 * @desc    Get MRs under a manager
 * @route   GET /api/users/manager/:managerId/mrs
 * @access  Admin or Manager
 */
const getMRsByManager = asyncHandler(async (req, res) => {
  const { managerId } = req.params;
  
  const mrs = await User.find({
    reportingManager: managerId,
    role: 'MR',
    isActive: true
  }).select('-password');
  
  ApiResponse.success(res, 'MRs retrieved successfully', {
    count: mrs.length,
    mrs
  });
});

module.exports = {
  loginUser,
  getAllUsers,
  getUserById,
  getMyProfile,
  createUser,
  updateUser,
  deleteUser,
  getMRsByManager
};
