const express = require('express');
const router = express.Router();

const VisitReport = require('../models/VisitReport');
const { authenticateToken, authorizeMRAccess } = require('../middleware/auth');
const { validateVisitReport, validatePagination, validateObjectId } = require('../middleware/validation');
const { catchAsync, AppError } = require('../middleware/errorHandler');

// @route   GET /api/v1/visits
// @desc    Get visit reports with filtering and pagination
// @access  Private
router.get('/', 
  authenticateToken,
  authorizeMRAccess,
  validatePagination,
  catchAsync(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      mrId,
      doctorId,
      startDate,
      endDate,
      status,
      visitOutcome
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    // If MR role, only show their visits
    if (req.user.workInfo.role === 'MR') {
      filter.mr = req.user._id;
    } else if (mrId) {
      filter.mr = mrId;
    }
    
    if (doctorId) filter.doctor = doctorId;
    if (status) filter.status = status;
    if (visitOutcome) filter['interaction.visitOutcome'] = visitOutcome;
    
    if (startDate || endDate) {
      filter['visitDetails.visitDate'] = {};
      if (startDate) filter['visitDetails.visitDate'].$gte = new Date(startDate);
      if (endDate) filter['visitDetails.visitDate'].$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [visits, total] = await Promise.all([
      VisitReport.find(filter)
        .populate('mr', 'personalInfo.name employeeId workInfo.territory')
        .populate('doctor', 'personalInfo.name personalInfo.specialization contactInfo.address.city')
        .populate('interaction.productsDiscussed.product', 'basicInfo.name basicInfo.category')
        .populate('orders.product', 'basicInfo.name businessInfo.mrp')
        .sort({ 'visitDetails.visitDate': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VisitReport.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        visits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalVisits: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  })
);

// @route   GET /api/v1/visits/:id
// @desc    Get visit report by ID
// @access  Private
router.get('/:id', 
  authenticateToken,
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const visit = await VisitReport.findById(req.params.id)
      .populate('mr', 'personalInfo.name employeeId workInfo.territory')
      .populate('doctor', 'personalInfo.name personalInfo.specialization contactInfo practiceInfo')
      .populate('interaction.productsDiscussed.product', 'basicInfo medicalInfo businessInfo')
      .populate('orders.product', 'basicInfo businessInfo')
      .populate('approvedBy', 'personalInfo.name');

    if (!visit) {
      throw new AppError('Visit report not found', 404);
    }

    // Check if MR can access this visit
    if (req.user.workInfo.role === 'MR' && visit.mr._id.toString() !== req.user._id.toString()) {
      throw new AppError('You can only access your own visit reports', 403);
    }

    res.json({
      success: true,
      data: { visit }
    });
  })
);

// @route   POST /api/v1/visits
// @desc    Create new visit report
// @access  Private/MR
router.post('/', 
  authenticateToken,
  validateVisitReport,
  catchAsync(async (req, res) => {
    const visitData = {
      ...req.body,
      mr: req.user._id // Always set to current user for MRs
    };

    const visit = new VisitReport(visitData);
    await visit.save();

    await visit.populate([
      { path: 'doctor', select: 'personalInfo.name contactInfo.address.city' },
      { path: 'interaction.productsDiscussed.product', select: 'basicInfo.name' },
      { path: 'orders.product', select: 'basicInfo.name businessInfo.mrp' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Visit report created successfully',
      data: { visit }
    });
  })
);

// @route   PUT /api/v1/visits/:id
// @desc    Update visit report
// @access  Private (MR can update own, Admin can update any)
router.put('/:id', 
  authenticateToken,
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const visit = await VisitReport.findById(req.params.id);
    
    if (!visit) {
      throw new AppError('Visit report not found', 404);
    }

    // Check if MR can update this visit
    if (req.user.workInfo.role === 'MR') {
      if (visit.mr.toString() !== req.user._id.toString()) {
        throw new AppError('You can only update your own visit reports', 403);
      }
      
      // MR can only update if status is Draft or Rejected
      if (!['Draft', 'Rejected'].includes(visit.status)) {
        throw new AppError('You can only update draft or rejected reports', 403);
      }
    }

    const updatedVisit = await VisitReport.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate([
      { path: 'doctor', select: 'personalInfo.name contactInfo.address.city' },
      { path: 'interaction.productsDiscussed.product', select: 'basicInfo.name' },
      { path: 'orders.product', select: 'basicInfo.name businessInfo.mrp' }
    ]);

    res.json({
      success: true,
      message: 'Visit report updated successfully',
      data: { visit: updatedVisit }
    });
  })
);

// @route   DELETE /api/v1/visits/:id
// @desc    Delete visit report (Admin only)
// @access  Private/Admin
router.delete('/:id', 
  authenticateToken,
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const visit = await VisitReport.findByIdAndDelete(req.params.id);

    if (!visit) {
      throw new AppError('Visit report not found', 404);
    }

    res.json({
      success: true,
      message: 'Visit report deleted successfully'
    });
  })
);

// @route   PUT /api/v1/visits/:id/approve
// @desc    Approve visit report (Admin only)
// @access  Private/Admin
router.put('/:id/approve', 
  authenticateToken,
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const visit = await VisitReport.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('mr', 'personalInfo.name');

    if (!visit) {
      throw new AppError('Visit report not found', 404);
    }

    res.json({
      success: true,
      message: 'Visit report approved successfully',
      data: { visit }
    });
  })
);

// @route   PUT /api/v1/visits/:id/reject
// @desc    Reject visit report (Admin only)
// @access  Private/Admin
router.put('/:id/reject', 
  authenticateToken,
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      throw new AppError('Rejection reason is required', 400);
    }

    const visit = await VisitReport.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        rejectionReason,
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('mr', 'personalInfo.name');

    if (!visit) {
      throw new AppError('Visit report not found', 404);
    }

    res.json({
      success: true,
      message: 'Visit report rejected',
      data: { visit }
    });
  })
);

// @route   GET /api/v1/visits/stats/summary
// @desc    Get visit statistics summary
// @access  Private
router.get('/stats/summary', 
  authenticateToken,
  authorizeMRAccess,
  catchAsync(async (req, res) => {
    const { mrId, startDate, endDate } = req.query;
    
    const matchFilter = {};
    
    // If MR role, only show their stats
    if (req.user.workInfo.role === 'MR') {
      matchFilter.mr = req.user._id;
    } else if (mrId) {
      matchFilter.mr = mrId;
    }
    
    if (startDate || endDate) {
      matchFilter['visitDetails.visitDate'] = {};
      if (startDate) matchFilter['visitDetails.visitDate'].$gte = new Date(startDate);
      if (endDate) matchFilter['visitDetails.visitDate'].$lte = new Date(endDate);
    }

    const stats = await VisitReport.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          positiveVisits: {
            $sum: {
              $cond: [{ $eq: ['$interaction.visitOutcome', 'Positive'] }, 1, 0]
            }
          },
          totalOrders: {
            $sum: { $size: '$orders' }
          },
          totalOrderValue: {
            $sum: {
              $sum: '$orders.totalAmount'
            }
          },
          uniqueDoctors: { $addToSet: '$doctor' },
          uniqueProducts: { $addToSet: '$interaction.productsDiscussed.product' }
        }
      },
      {
        $project: {
          totalVisits: 1,
          positiveVisits: 1,
          totalOrders: 1,
          totalOrderValue: 1,
          uniqueDoctorsCount: { $size: '$uniqueDoctors' },
          uniqueProductsCount: { $size: '$uniqueProducts' },
          successRate: {
            $multiply: [
              { $divide: ['$positiveVisits', '$totalVisits'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });
  })
);

module.exports = router;