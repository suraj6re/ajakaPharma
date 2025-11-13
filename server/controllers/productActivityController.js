const { ProductActivityLog } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getAllActivities = asyncHandler(async (req, res) => {
  const { productId, doctorId, activityType, startDate, endDate } = req.query;
  const query = {};
  
  const userRole = req.user.workInfo?.role || req.user.role;
  if (userRole?.toLowerCase() === 'mr') {
    query.mr = req.user._id;
  }
  
  if (productId) query.product = productId;
  if (doctorId) query.doctor = doctorId;
  if (activityType) query.activity_type = activityType;
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  const activities = await ProductActivityLog.find(query)
    .populate('product', 'basicInfo.name productId')
    .populate('mr', 'personalInfo.name employeeId')
    .populate('doctor', 'personalInfo.name doctorId')
    .populate('visit_report', 'visitId')
    .sort({ date: -1 });
  
  ApiResponse.success(res, 'Activities retrieved successfully', { count: activities.length, activities });
});

const getActivityById = asyncHandler(async (req, res) => {
  const activity = await ProductActivityLog.findById(req.params.id)
    .populate('product', 'basicInfo medicalInfo')
    .populate('mr', 'personalInfo workInfo')
    .populate('doctor', 'personalInfo contactInfo')
    .populate('visit_report')
    .populate('order');
  
  if (!activity) return ApiResponse.notFound(res, 'Activity not found');
  
  const userRole = req.user.workInfo?.role || req.user.role;
  if (userRole?.toLowerCase() === 'mr' && activity.mr._id.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied');
  }
  
  ApiResponse.success(res, 'Activity retrieved successfully', activity);
});

const createActivity = asyncHandler(async (req, res) => {
  const { product, doctor, activity_type, quantity, doctor_feedback, interest_level, outcome, notes } = req.body;
  
  const activity = await ProductActivityLog.create({
    product,
    mr: req.user._id,
    doctor,
    activity_type,
    quantity,
    doctor_feedback,
    interest_level,
    outcome,
    notes
  });
  
  await activity.populate([
    { path: 'product', select: 'basicInfo.name' },
    { path: 'doctor', select: 'personalInfo.name' }
  ]);
  
  ApiResponse.created(res, 'Activity logged successfully', activity);
});

const getProductAnalytics = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { startDate, endDate } = req.query;
  
  const matchQuery = { product: productId };
  if (startDate || endDate) {
    matchQuery.date = {};
    if (startDate) matchQuery.date.$gte = new Date(startDate);
    if (endDate) matchQuery.date.$lte = new Date(endDate);
  }
  
  const analytics = await ProductActivityLog.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$activity_type',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        uniqueDoctors: { $addToSet: '$doctor' },
        uniqueMRs: { $addToSet: '$mr' }
      }
    },
    {
      $project: {
        activity_type: '$_id',
        count: 1,
        totalQuantity: 1,
        uniqueDoctorsCount: { $size: '$uniqueDoctors' },
        uniqueMRsCount: { $size: '$uniqueMRs' }
      }
    }
  ]);
  
  ApiResponse.success(res, 'Product analytics retrieved successfully', analytics);
});

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity,
  getProductAnalytics
};
