const { VisitReport, ProductActivityLog } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all visit reports
 * @route   GET /api/visit-reports
 * @access  Private (Admin sees all, MR sees only their own)
 */
const getAllVisitReports = asyncHandler(async (req, res) => {
  const { status, doctorId, startDate, endDate } = req.query;
  
  const query = {};
  
  // MR can only see their own visits
  const userRole = req.user.role;
  if (userRole?.toLowerCase() === 'mr') {
    query.mr = req.user._id;
  }
  
  if (status) {
    query.status = status;
  }
  
  if (doctorId) {
    query.doctor = doctorId;
  }
  
  if (startDate || endDate) {
    query['visitDetails.visitDate'] = {};
    if (startDate) query['visitDetails.visitDate'].$gte = new Date(startDate);
    if (endDate) query['visitDetails.visitDate'].$lte = new Date(endDate);
  }
  
  const visits = await VisitReport.find(query)
    .populate('mr', 'name employeeId territory')
    .populate('doctor', 'name place')
    .populate('interaction.productsDiscussed.product', 'basicInfo.name productId')
    .populate('orders.product', 'basicInfo.name productId')
    .populate('approvedBy', 'name')
    .select('-__v')
    .sort({ 'visitDetails.visitDate': -1 });
  
  ApiResponse.success(res, 'Visit reports retrieved successfully', {
    count: visits.length,
    visits
  });
});

/**
 * @desc    Get visit report by ID
 * @route   GET /api/visit-reports/:id
 * @access  Private
 */
const getVisitReportById = asyncHandler(async (req, res) => {
  const visit = await VisitReport.findById(req.params.id)
    .populate('mr', 'name employeeId territory')
    .populate('doctor', 'name qualification place')
    .populate('interaction.productsDiscussed.product', 'basicInfo medicalInfo')
    .populate('orders.product', 'basicInfo businessInfo')
    .populate('approvedBy', 'name')
    .select('-__v');
  
  if (!visit) {
    return ApiResponse.notFound(res, 'Visit report not found');
  }
  
  // Check if MR has access
  const userRole = req.user.role;
  if (userRole?.toLowerCase() === 'mr' && visit.mr._id.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied. You can only view your own visit reports.');
  }
  
  ApiResponse.success(res, 'Visit report retrieved successfully', visit);
});

/**
 * @desc    Create new visit report
 * @route   POST /api/visit-reports
 * @access  MR
 */
const createVisitReport = asyncHandler(async (req, res) => {
  // Support both complex and simple formats
  let { doctor, visitDetails, interaction, orders, attachments, mr, productsDiscussed, notes, visitDate } = req.body;
  
  // Simple format from frontend (backward compatibility)
  if (!visitDetails && (visitDate || notes || productsDiscussed)) {
    visitDetails = {
      visitDate: visitDate || new Date(),
      duration: 30,
      visitType: 'Scheduled'
    };
    
    interaction = {
      productsDiscussed: productsDiscussed ? productsDiscussed.map(productId => ({
        product: productId,
        samplesGiven: 0,
        interestLevel: 'Medium'
      })) : [],
      discussionPoints: notes || '',
      visitOutcome: 'Positive'
    };
  }
  
  // Force MR to be the logged-in user (or use provided mr for testing)
  const visitData = {
    mr: req.user._id || mr,
    doctor,
    visitDetails: visitDetails || {
      visitDate: new Date(),
      duration: 30,
      visitType: 'Scheduled'
    },
    interaction: interaction || {
      productsDiscussed: [],
      discussionPoints: '',
      visitOutcome: 'Positive'
    },
    orders: orders || [],
    attachments: attachments || [],
    status: 'Submitted'
  };
  
  const visit = await VisitReport.create(visitData);
  
  // Create ProductActivityLog entries for each product discussed
  if (interaction?.productsDiscussed && interaction.productsDiscussed.length > 0) {
    const activityLogs = interaction.productsDiscussed.map(item => ({
      product: item.product,
      mr: req.user._id || mr,
      doctor,
      activity_type: item.samplesGiven > 0 ? 'Sample Given' : 'Discussion',
      quantity: item.samplesGiven || 0,
      doctor_feedback: item.doctorFeedback,
      interest_level: item.interestLevel,
      outcome: interaction.visitOutcome,
      visit_report: visit._id,
      date: visitDetails.visitDate || new Date()
    }));
    
    await ProductActivityLog.insertMany(activityLogs);
  }
  
  // Create ProductActivityLog for orders
  if (orders && orders.length > 0) {
    const orderLogs = orders.map(order => ({
      product: order.product,
      mr: req.user._id || mr,
      doctor,
      activity_type: 'Order Placed',
      quantity: order.quantity,
      outcome: 'Positive',
      visit_report: visit._id,
      date: visitDetails.visitDate || new Date()
    }));
    
    await ProductActivityLog.insertMany(orderLogs);
  }
  
  await visit.populate([
    { path: 'mr', select: 'personalInfo.name employeeId' },
    { path: 'doctor', select: 'personalInfo.name doctorId' },
    { path: 'interaction.productsDiscussed.product', select: 'basicInfo.name' }
  ]);
  
  ApiResponse.created(res, 'Visit report created successfully', visit);
});

/**
 * @desc    Update visit report
 * @route   PUT /api/visit-reports/:id
 * @access  MR (own reports) or Admin
 */
const updateVisitReport = asyncHandler(async (req, res) => {
  const visit = await VisitReport.findById(req.params.id);
  
  if (!visit) {
    return ApiResponse.notFound(res, 'Visit report not found');
  }
  
  // Check if MR has access
  const userRole = req.user.workInfo?.role || req.user.role;
  if (userRole?.toLowerCase() === 'mr' && visit.mr.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied. You can only update your own visit reports.');
  }
  
  // MR can only update if status is Draft or Rejected
  if (userRole?.toLowerCase() === 'mr' && !['Draft', 'Rejected'].includes(visit.status)) {
    return ApiResponse.badRequest(res, 'Cannot update submitted or approved visit reports');
  }
  
  const { visitDetails, interaction, orders, attachments, status } = req.body;
  
  if (visitDetails) Object.assign(visit.visitDetails, visitDetails);
  if (interaction) Object.assign(visit.interaction, interaction);
  if (orders) visit.orders = orders;
  if (attachments) visit.attachments = attachments;
  
  // Only admin can change status
  if (userRole?.toLowerCase() === 'admin' && status) {
    visit.status = status;
    if (status === 'Approved') {
      visit.approvedBy = req.user._id;
      visit.approvedAt = new Date();
    }
  }
  
  await visit.save();
  
  ApiResponse.success(res, 'Visit report updated successfully', visit);
});

/**
 * @desc    Delete visit report
 * @route   DELETE /api/visit-reports/:id
 * @access  Admin or MR (own draft reports)
 */
const deleteVisitReport = asyncHandler(async (req, res) => {
  const visit = await VisitReport.findById(req.params.id);
  
  if (!visit) {
    return ApiResponse.notFound(res, 'Visit report not found');
  }
  
  const userRole = req.user.workInfo?.role || req.user.role;
  
  // MR can only delete their own draft reports
  if (userRole?.toLowerCase() === 'mr') {
    if (visit.mr.toString() !== req.user._id.toString()) {
      return ApiResponse.forbidden(res, 'Access denied');
    }
    if (visit.status !== 'Draft') {
      return ApiResponse.badRequest(res, 'Can only delete draft reports');
    }
  }
  
  await visit.deleteOne();
  
  ApiResponse.success(res, 'Visit report deleted successfully');
});

/**
 * @desc    Approve visit report
 * @route   POST /api/visit-reports/:id/approve
 * @access  Admin
 */
const approveVisitReport = asyncHandler(async (req, res) => {
  const visit = await VisitReport.findById(req.params.id);
  
  if (!visit) {
    return ApiResponse.notFound(res, 'Visit report not found');
  }
  
  if (visit.status === 'Approved') {
    return ApiResponse.badRequest(res, 'Visit report already approved');
  }
  
  visit.status = 'Approved';
  visit.approvedBy = req.user._id;
  visit.approvedAt = new Date();
  
  await visit.save();
  
  ApiResponse.success(res, 'Visit report approved successfully', visit);
});

/**
 * @desc    Reject visit report
 * @route   POST /api/visit-reports/:id/reject
 * @access  Admin
 */
const rejectVisitReport = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const visit = await VisitReport.findById(req.params.id);
  
  if (!visit) {
    return ApiResponse.notFound(res, 'Visit report not found');
  }
  
  visit.status = 'Rejected';
  visit.rejectionReason = reason;
  
  await visit.save();
  
  ApiResponse.success(res, 'Visit report rejected successfully', visit);
});

module.exports = {
  getAllVisitReports,
  getVisitReportById,
  createVisitReport,
  updateVisitReport,
  deleteVisitReport,
  approveVisitReport,
  rejectVisitReport
};
