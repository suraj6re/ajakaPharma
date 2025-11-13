const { MRTarget } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getAllTargets = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const query = {};
  
  const userRole = req.user.workInfo?.role || req.user.role;
  if (userRole?.toLowerCase() === 'mr') {
    query.mr = req.user._id;
  }
  
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);
  
  const targets = await MRTarget.find(query)
    .populate('mr', 'personalInfo.name employeeId workInfo.territory')
    .populate('created_by', 'personalInfo.name')
    .sort({ year: -1, month: -1 });
  
  ApiResponse.success(res, 'Targets retrieved successfully', { count: targets.length, targets });
});

const getTargetById = asyncHandler(async (req, res) => {
  const target = await MRTarget.findById(req.params.id)
    .populate('mr', 'personalInfo workInfo')
    .populate('created_by', 'personalInfo.name');
  
  if (!target) return ApiResponse.notFound(res, 'Target not found');
  
  const userRole = req.user.workInfo?.role || req.user.role;
  if (userRole?.toLowerCase() === 'mr' && target.mr._id.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied');
  }
  
  ApiResponse.success(res, 'Target retrieved successfully', target);
});

const createTarget = asyncHandler(async (req, res) => {
  const { mr, month, year, target_visits, target_sales, target_new_doctors, target_orders, notes } = req.body;
  
  const existingTarget = await MRTarget.findOne({ mr, month, year });
  if (existingTarget) {
    return ApiResponse.badRequest(res, 'Target already exists for this MR and period');
  }
  
  const target = await MRTarget.create({
    mr,
    month,
    year,
    target_visits,
    target_sales,
    target_new_doctors,
    target_orders,
    notes,
    created_by: req.user._id
  });
  
  await target.populate('mr', 'personalInfo.name employeeId');
  ApiResponse.created(res, 'Target created successfully', target);
});

const updateTarget = asyncHandler(async (req, res) => {
  const target = await MRTarget.findById(req.params.id);
  if (!target) return ApiResponse.notFound(res, 'Target not found');
  
  const { target_visits, target_sales, target_new_doctors, target_orders, notes, status } = req.body;
  
  if (target_visits !== undefined) target.target_visits = target_visits;
  if (target_sales !== undefined) target.target_sales = target_sales;
  if (target_new_doctors !== undefined) target.target_new_doctors = target_new_doctors;
  if (target_orders !== undefined) target.target_orders = target_orders;
  if (notes) target.notes = notes;
  if (status) target.status = status;
  
  await target.save();
  ApiResponse.success(res, 'Target updated successfully', target);
});

const deleteTarget = asyncHandler(async (req, res) => {
  const target = await MRTarget.findById(req.params.id);
  if (!target) return ApiResponse.notFound(res, 'Target not found');
  
  await target.deleteOne();
  ApiResponse.success(res, 'Target deleted successfully');
});

module.exports = {
  getAllTargets,
  getTargetById,
  createTarget,
  updateTarget,
  deleteTarget
};
