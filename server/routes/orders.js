const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const { authenticateToken, authorizeRoles, authorizeMRAccess } = require('../middleware/auth');
const { validateOrder, validatePagination, validateObjectId } = require('../middleware/validation');
const { catchAsync, AppError } = require('../middleware/errorHandler');

// @route   GET /api/v1/orders
// @desc    Get orders with filtering and pagination
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
      status,
      orderType,
      startDate,
      endDate
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    // If MR role, only show their orders
    if (req.user.workInfo.role === 'MR') {
      filter.mr = req.user._id;
    } else if (mrId) {
      filter.mr = mrId;
    }
    
    if (doctorId) filter.doctor = doctorId;
    if (status) filter.status = status;
    if (orderType) filter['orderDetails.orderType'] = orderType;
    
    if (startDate || endDate) {
      filter['orderDetails.orderDate'] = {};
      if (startDate) filter['orderDetails.orderDate'].$gte = new Date(startDate);
      if (endDate) filter['orderDetails.orderDate'].$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('mr', 'personalInfo.name employeeId')
        .populate('doctor', 'personalInfo.name contactInfo.address.city')
        .populate('items.product', 'basicInfo.name businessInfo.mrp')
        .populate('visitReport', 'visitId')
        .sort({ 'orderDetails.orderDate': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  })
);

// @route   GET /api/v1/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', 
  authenticateToken,
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id)
      .populate('mr', 'personalInfo.name employeeId workInfo.territory')
      .populate('doctor', 'personalInfo contactInfo practiceInfo')
      .populate('items.product', 'basicInfo medicalInfo businessInfo')
      .populate('visitReport', 'visitId visitDetails.visitDate')
      .populate('statusHistory.updatedBy', 'personalInfo.name');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if MR can access this order
    if (req.user.workInfo.role === 'MR' && order.mr._id.toString() !== req.user._id.toString()) {
      throw new AppError('You can only access your own orders', 403);
    }

    res.json({
      success: true,
      data: { order }
    });
  })
);

// @route   POST /api/v1/orders
// @desc    Create new order
// @access  Private/MR
router.post('/', 
  authenticateToken,
  validateOrder,
  catchAsync(async (req, res) => {
    const orderData = {
      ...req.body,
      mr: req.user._id // Always set to current user for MRs
    };

    const order = new Order(orderData);
    await order.save();

    await order.populate([
      { path: 'doctor', select: 'personalInfo.name contactInfo.address.city' },
      { path: 'items.product', select: 'basicInfo.name businessInfo.mrp' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  })
);

// @route   PUT /api/v1/orders/:id
// @desc    Update order
// @access  Private (MR can update own pending orders, Admin can update any)
router.put('/:id', 
  authenticateToken,
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if MR can update this order
    if (req.user.workInfo.role === 'MR') {
      if (order.mr.toString() !== req.user._id.toString()) {
        throw new AppError('You can only update your own orders', 403);
      }
      
      // MR can only update pending orders
      if (order.status !== 'Pending') {
        throw new AppError('You can only update pending orders', 403);
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate([
      { path: 'doctor', select: 'personalInfo.name contactInfo.address.city' },
      { path: 'items.product', select: 'basicInfo.name businessInfo.mrp' }
    ]);

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: { order: updatedOrder }
    });
  })
);

// @route   PUT /api/v1/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', 
  authenticateToken,
  authorizeRoles('Admin'),
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const { status, notes } = req.body;
    
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Add to status history
    order.statusHistory.push({
      status,
      updatedBy: req.user._id,
      notes
    });

    order.status = status;
    
    // Set delivery date if delivered
    if (status === 'Delivered') {
      order.orderDetails.actualDeliveryDate = new Date();
    }

    await order.save();

    await order.populate('mr', 'personalInfo.name');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  })
);

// @route   DELETE /api/v1/orders/:id
// @desc    Cancel order
// @access  Private (MR can cancel own pending orders, Admin can cancel any)
router.delete('/:id', 
  authenticateToken,
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const { cancellationReason } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if MR can cancel this order
    if (req.user.workInfo.role === 'MR') {
      if (order.mr.toString() !== req.user._id.toString()) {
        throw new AppError('You can only cancel your own orders', 403);
      }
      
      if (!['Pending', 'Confirmed'].includes(order.status)) {
        throw new AppError('You can only cancel pending or confirmed orders', 403);
      }
    }

    order.status = 'Cancelled';
    order.cancellationReason = cancellationReason || 'Cancelled by user';
    
    // Add to status history
    order.statusHistory.push({
      status: 'Cancelled',
      updatedBy: req.user._id,
      notes: cancellationReason
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  })
);

// @route   GET /api/v1/orders/stats/summary
// @desc    Get order statistics summary
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
      matchFilter['orderDetails.orderDate'] = {};
      if (startDate) matchFilter['orderDetails.orderDate'].$gte = new Date(startDate);
      if (endDate) matchFilter['orderDetails.orderDate'].$lte = new Date(endDate);
    }

    const stats = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalValue: { $sum: '$financial.grandTotal' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          },
          avgOrderValue: { $avg: '$financial.grandTotal' }
        }
      }
    ]);

    // Get top products
    const topProducts = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalValue: { $sum: '$items.totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.basicInfo.name',
          totalQuantity: 1,
          totalValue: 1,
          orderCount: 1
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: { 
        stats: stats[0] || {},
        topProducts
      }
    });
  })
);

module.exports = router;