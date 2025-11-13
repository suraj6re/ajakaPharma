const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Product = require('../models/Product');
const VisitReport = require('../models/VisitReport');
const Order = require('../models/Order');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');
const { catchAsync, AppError } = require('../middleware/errorHandler');

// @route   GET /api/v1/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', 
  authenticateToken,
  authorizeRoles('Admin'),
  catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get KPIs
    const [
      totalDoctors,
      totalProducts,
      totalMRs,
      totalVisits,
      totalOrders,
      totalOrderValue
    ] = await Promise.all([
      Doctor.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ 'workInfo.role': 'MR', isActive: true }),
      VisitReport.countDocuments(dateFilter),
      Order.countDocuments(dateFilter),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$financial.grandTotal' } } }
      ])
    ]);

    // Get chart data - Orders per product
    const productOrdersChart = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          orders: { $sum: '$items.quantity' },
          value: { $sum: '$items.totalAmount' }
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
          name: '$product.basicInfo.name',
          orders: 1,
          value: 1
        }
      },
      { $sort: { orders: -1 } },
      { $limit: 10 }
    ]);

    // Get visits trend (last 7 days)
    const visitsTrend = await VisitReport.aggregate([
      {
        $match: {
          'visitDetails.visitDate': {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$visitDetails.visitDate'
            }
          },
          visits: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          value: { $sum: '$financial.grandTotal' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        kpis: {
          totalDoctors,
          totalProducts,
          totalMRs,
          totalVisits,
          totalOrders,
          totalOrderValue: totalOrderValue[0]?.total || 0
        },
        charts: {
          productOrders: productOrdersChart,
          visitsTrend,
          ordersByStatus
        }
      }
    });
  })
);

// @route   GET /api/v1/admin/mr-performance
// @desc    Get MR performance data
// @access  Private/Admin
router.get('/mr-performance', 
  authenticateToken,
  authorizeRoles('Admin'),
  validatePagination,
  catchAsync(async (req, res) => {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // Build date filter for visits and orders
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter['visitDetails.visitDate'] = {};
      if (startDate) dateFilter['visitDetails.visitDate'].$gte = new Date(startDate);
      if (endDate) dateFilter['visitDetails.visitDate'].$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const mrPerformance = await User.aggregate([
      { 
        $match: { 
          'workInfo.role': 'MR', 
          isActive: true 
        } 
      },
      {
        $lookup: {
          from: 'visitreports',
          let: { mrId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$mr', '$$mrId'] } } },
            { $match: dateFilter }
          ],
          as: 'visits'
        }
      },
      {
        $lookup: {
          from: 'orders',
          let: { mrId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$mr', '$$mrId'] } } },
            ...(Object.keys(dateFilter).length > 0 ? [
              { $match: { 'orderDetails.orderDate': dateFilter['visitDetails.visitDate'] } }
            ] : [])
          ],
          as: 'orders'
        }
      },
      {
        $project: {
          id: '$_id',
          name: '$personalInfo.name',
          employeeId: 1,
          territory: '$workInfo.territory',
          region: '$workInfo.region',
          visits: { $size: '$visits' },
          orders: { $size: '$orders' },
          totalOrderValue: {
            $sum: '$orders.financial.grandTotal'
          },
          positiveVisits: {
            $size: {
              $filter: {
                input: '$visits',
                cond: { $eq: ['$$this.interaction.visitOutcome', 'Positive'] }
              }
            }
          },
          uniqueDoctors: {
            $size: {
              $setUnion: ['$visits.doctor', []]
            }
          }
        }
      },
      {
        $addFields: {
          performance: {
            $cond: [
              { $gt: ['$visits', 0] },
              {
                $multiply: [
                  {
                    $add: [
                      { $multiply: [{ $divide: ['$positiveVisits', '$visits'] }, 40] },
                      { $multiply: [{ $min: [{ $divide: ['$orders', 10] }, 1] }, 30] },
                      { $multiply: [{ $min: [{ $divide: ['$uniqueDoctors', 20] }, 1] }, 30] }
                    ]
                  },
                  1
                ]
              },
              0
            ]
          },
          successRate: {
            $cond: [
              { $gt: ['$visits', 0] },
              { $multiply: [{ $divide: ['$positiveVisits', '$visits'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { performance: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    // Get total count for pagination
    const totalMRs = await User.countDocuments({ 'workInfo.role': 'MR', isActive: true });

    res.json({
      success: true,
      data: {
        mrPerformance,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMRs / limit),
          totalMRs,
          hasNext: page * limit < totalMRs,
          hasPrev: page > 1
        }
      }
    });
  })
);

// @route   GET /api/v1/admin/reports
// @desc    Get comprehensive reports
// @access  Private/Admin
router.get('/reports', 
  authenticateToken,
  authorizeRoles('Admin'),
  catchAsync(async (req, res) => {
    const { 
      reportType = 'summary',
      startDate,
      endDate,
      mrId,
      territory,
      region
    } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let reportData = {};

    switch (reportType) {
      case 'visits':
        reportData = await getVisitsReport(dateFilter, mrId, territory, region);
        break;
      case 'orders':
        reportData = await getOrdersReport(dateFilter, mrId, territory, region);
        break;
      case 'doctors':
        reportData = await getDoctorsReport(territory, region);
        break;
      case 'products':
        reportData = await getProductsReport(dateFilter);
        break;
      default:
        reportData = await getSummaryReport(dateFilter, territory, region);
    }

    res.json({
      success: true,
      data: reportData
    });
  })
);

// Helper functions for different report types
async function getSummaryReport(dateFilter, territory, region) {
  const mrFilter = { 'workInfo.role': 'MR', isActive: true };
  if (territory) mrFilter['workInfo.territory'] = territory;
  if (region) mrFilter['workInfo.region'] = region;

  const [
    totalVisits,
    totalOrders,
    totalOrderValue,
    activeMRs,
    activeDoctors,
    activeProducts
  ] = await Promise.all([
    VisitReport.countDocuments(dateFilter),
    Order.countDocuments(dateFilter),
    Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$financial.grandTotal' } } }
    ]),
    User.countDocuments(mrFilter),
    Doctor.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true })
  ]);

  return {
    summary: {
      totalVisits,
      totalOrders,
      totalOrderValue: totalOrderValue[0]?.total || 0,
      activeMRs,
      activeDoctors,
      activeProducts
    }
  };
}

async function getVisitsReport(dateFilter, mrId, territory, region) {
  const matchFilter = { ...dateFilter };
  
  if (mrId) {
    matchFilter.mr = mrId;
  } else if (territory || region) {
    const mrFilter = { 'workInfo.role': 'MR', isActive: true };
    if (territory) mrFilter['workInfo.territory'] = territory;
    if (region) mrFilter['workInfo.region'] = region;
    
    const mrs = await User.find(mrFilter).select('_id');
    matchFilter.mr = { $in: mrs.map(mr => mr._id) };
  }

  const visits = await VisitReport.aggregate([
    { $match: matchFilter },
    {
      $lookup: {
        from: 'users',
        localField: 'mr',
        foreignField: '_id',
        as: 'mrInfo'
      }
    },
    {
      $lookup: {
        from: 'doctors',
        localField: 'doctor',
        foreignField: '_id',
        as: 'doctorInfo'
      }
    },
    {
      $project: {
        visitId: 1,
        visitDate: '$visitDetails.visitDate',
        mrName: { $arrayElemAt: ['$mrInfo.personalInfo.name', 0] },
        doctorName: { $arrayElemAt: ['$doctorInfo.personalInfo.name', 0] },
        city: { $arrayElemAt: ['$doctorInfo.contactInfo.address.city', 0] },
        visitOutcome: '$interaction.visitOutcome',
        ordersCount: { $size: '$orders' },
        totalOrderValue: { $sum: '$orders.totalAmount' }
      }
    },
    { $sort: { visitDate: -1 } }
  ]);

  return { visits };
}

async function getOrdersReport(dateFilter, mrId, territory, region) {
  const matchFilter = { ...dateFilter };
  
  if (mrId) {
    matchFilter.mr = mrId;
  } else if (territory || region) {
    const mrFilter = { 'workInfo.role': 'MR', isActive: true };
    if (territory) mrFilter['workInfo.territory'] = territory;
    if (region) mrFilter['workInfo.region'] = region;
    
    const mrs = await User.find(mrFilter).select('_id');
    matchFilter.mr = { $in: mrs.map(mr => mr._id) };
  }

  const orders = await Order.aggregate([
    { $match: matchFilter },
    {
      $lookup: {
        from: 'users',
        localField: 'mr',
        foreignField: '_id',
        as: 'mrInfo'
      }
    },
    {
      $lookup: {
        from: 'doctors',
        localField: 'doctor',
        foreignField: '_id',
        as: 'doctorInfo'
      }
    },
    {
      $project: {
        orderId: 1,
        orderDate: '$orderDetails.orderDate',
        mrName: { $arrayElemAt: ['$mrInfo.personalInfo.name', 0] },
        doctorName: { $arrayElemAt: ['$doctorInfo.personalInfo.name', 0] },
        status: 1,
        itemsCount: { $size: '$items' },
        totalValue: '$financial.grandTotal'
      }
    },
    { $sort: { orderDate: -1 } }
  ]);

  return { orders };
}

async function getDoctorsReport(territory, region) {
  const mrFilter = { 'workInfo.role': 'MR', isActive: true };
  if (territory) mrFilter['workInfo.territory'] = territory;
  if (region) mrFilter['workInfo.region'] = region;

  let doctorFilter = { isActive: true };
  
  if (territory || region) {
    const mrs = await User.find(mrFilter).select('_id');
    doctorFilter.assignedMRs = { $in: mrs.map(mr => mr._id) };
  }

  const doctors = await Doctor.find(doctorFilter)
    .populate('assignedMRs', 'personalInfo.name workInfo.territory')
    .select('personalInfo contactInfo practiceInfo assignedMRs')
    .sort({ 'personalInfo.name': 1 });

  return { doctors };
}

async function getProductsReport(dateFilter) {
  const products = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'orders',
        let: { productId: '$_id' },
        pipeline: [
          { $match: dateFilter },
          { $unwind: '$items' },
          { $match: { $expr: { $eq: ['$items.product', '$$productId'] } } }
        ],
        as: 'orders'
      }
    },
    {
      $project: {
        productId: 1,
        name: '$basicInfo.name',
        category: '$basicInfo.category',
        mrp: '$businessInfo.mrp',
        stockQuantity: '$inventory.stockQuantity',
        ordersCount: { $size: '$orders' },
        totalQuantitySold: {
          $sum: '$orders.items.quantity'
        },
        totalRevenue: {
          $sum: '$orders.items.totalAmount'
        }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  return { products };
}

module.exports = router;