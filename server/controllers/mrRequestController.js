const { MRRequest, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const emailService = require('../services/emailService');

/**
 * @desc    Submit MR access request
 * @route   POST /api/mr-requests
 * @access  Public
 */
const submitRequest = asyncHandler(async (req, res) => {
  const { name, email, phone, area, experience } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !area) {
    return ApiResponse.badRequest(res, 'Please provide all required fields');
  }

  // Check if email already exists in requests
  const existingRequest = await MRRequest.findOne({ 
    email: email.toLowerCase(),
    status: 'pending'
  });

  if (existingRequest) {
    return ApiResponse.badRequest(res, 'An application with this email is already pending');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return ApiResponse.badRequest(res, 'An account with this email already exists');
  }

  // Create MR request
  const mrRequest = await MRRequest.create({
    name,
    email: email.toLowerCase(),
    phone,
    area,
    experience: experience || ''
  });

  // Send confirmation email
  try {
    await emailService.sendApplicationReceivedEmail(name, email, phone, area);
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError);
    // Don't fail the request if email fails
  }

  ApiResponse.created(res, 'Application submitted successfully', {
    id: mrRequest._id,
    name: mrRequest.name,
    email: mrRequest.email,
    status: mrRequest.status
  });
});

/**
 * @desc    Get all MR requests
 * @route   GET /api/mr-requests
 * @access  Admin
 */
const getAllRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }

  const requests = await MRRequest.find(query)
    .populate('processedBy', 'name email')
    .populate('createdUserId', 'name email employeeId')
    .sort({ createdAt: -1 });

  ApiResponse.success(res, 'MR requests retrieved successfully', {
    count: requests.length,
    requests
  });
});

/**
 * @desc    Get single MR request
 * @route   GET /api/mr-requests/:id
 * @access  Admin
 */
const getRequestById = asyncHandler(async (req, res) => {
  const request = await MRRequest.findById(req.params.id)
    .populate('processedBy', 'name email')
    .populate('createdUserId', 'name email employeeId');

  if (!request) {
    return ApiResponse.notFound(res, 'MR request not found');
  }

  ApiResponse.success(res, 'MR request retrieved successfully', request);
});

/**
 * @desc    Approve MR request
 * @route   PUT /api/mr-requests/:id/approve
 * @access  Admin
 */
const approveRequest = asyncHandler(async (req, res) => {
  const request = await MRRequest.findById(req.params.id);

  if (!request) {
    return ApiResponse.notFound(res, 'MR request not found');
  }

  if (request.status !== 'pending') {
    return ApiResponse.badRequest(res, 'Request has already been processed');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: request.email });
  if (existingUser) {
    return ApiResponse.badRequest(res, 'User with this email already exists');
  }

  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-10).toUpperCase();
  
  // Generate employee ID
  const userCount = await User.countDocuments({ role: 'MR' });
  const employeeId = `MR${String(userCount + 1).padStart(3, '0')}`;

  // Create user account (pass plain text password - pre-save hook will hash it)
  const newUser = await User.create({
    name: request.name,
    email: request.email,
    password: tempPassword,  // Plain text - User model will hash it
    role: 'MR',
    employeeId,
    phone: request.phone,
    territory: request.area,
    region: request.area,
    city: request.area,
    isActive: true
  });

  // Update request
  request.status = 'approved';
  request.processedBy = req.user._id;
  request.processedAt = new Date();
  request.tempPassword = tempPassword;
  request.createdUserId = newUser._id;
  await request.save();

  // Send approval email
  try {
    console.log('📧 Attempting to send approval email to:', request.email);
    const emailResult = await emailService.sendApprovalEmail(request.email, tempPassword);
    if (emailResult.success) {
      console.log('✅ Approval email sent successfully');
    } else {
      console.error('❌ Failed to send approval email:', emailResult.error);
    }
  } catch (emailError) {
    console.error('❌ Exception sending approval email:', emailError);
    // Don't fail the approval if email fails
  }

  ApiResponse.success(res, 'MR request approved successfully', {
    request,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      employeeId: newUser.employeeId
    },
    credentials: {
      email: request.email,
      tempPassword: tempPassword
    }
  });
});

/**
 * @desc    Reject MR request
 * @route   PUT /api/mr-requests/:id/reject
 * @access  Admin
 */
const rejectRequest = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const request = await MRRequest.findById(req.params.id);

  if (!request) {
    return ApiResponse.notFound(res, 'MR request not found');
  }

  if (request.status !== 'pending') {
    return ApiResponse.badRequest(res, 'Request has already been processed');
  }

  // Update request
  request.status = 'rejected';
  request.processedBy = req.user._id;
  request.processedAt = new Date();
  request.rejectionReason = reason || 'Application not approved';
  await request.save();

  // Send rejection email
  try {
    await emailService.sendRejectionEmail(request.email);
  } catch (emailError) {
    console.error('Failed to send rejection email:', emailError);
    // Don't fail the rejection if email fails
  }

  ApiResponse.success(res, 'MR request rejected successfully', request);
});

/**
 * @desc    Delete MR request
 * @route   DELETE /api/mr-requests/:id
 * @access  Admin
 */
const deleteRequest = asyncHandler(async (req, res) => {
  const request = await MRRequest.findById(req.params.id);

  if (!request) {
    return ApiResponse.notFound(res, 'MR request not found');
  }

  await request.deleteOne();

  ApiResponse.success(res, 'MR request deleted successfully');
});

module.exports = {
  submitRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  deleteRequest
};
