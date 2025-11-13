const { MRPerformanceLog } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getAllPerformanceLogs = asyncHandler(async (req, res) => {
  const { month, year, status } = req.query;
  const query = {};
  
  const userRole = req.user.workInfo?.role || req.user.role;
  if (userRole?.toLowerCase() === 'mr') {
    query.mr = req.user._id;
  }
  
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);
  if (status) query.status = status;
  
  const logs = await MRPerformanceLog.find(query)
    .populate('mr', 'personalInfo.name employeeId workInfo.territory')
    .populate('verified_by', 'personalInfo.name')
    .sort({ year: -1, month: -1 });
  
  ApiResponse.success(res, 'Performance logs retrieved successfully', { count: logs.length, logs });
});

const getPerformanceLogById = asyncHandler(async (req, res) => {
  const log = await MRPerformanceLog.findById(req.params.id)
    .populate('mr', 'personalInfo workInfo')
    .populate('verified_by', 'personalInfo.name');
  
  if (!log) return ApiResponse.notFound(res, 'Performance log not found');
  
  const userRole = req.user.workInfo?.role || req.user.role;
  if (userRole?.toLowerCase() === 'mr' && log.mr._id.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied');
  }
  
  ApiResponse.success(res, 'Performance log retrieved successfully', log);
});

const createPerformanceLog = asyncHandler(async (req, res) => {
  const { mr, month, year, ...performanceData } = req.body;
  
  const existingLog = await MRPerformanceLog.findOne({ mr, month, year });
  if (existingLog) {
    return ApiResponse.badRequest(res, 'Performance log already exists for this MR and period');
  }
  
  const log = await MRPerformanceLog.create({
    mr,
    month,
    year,
    ...performanceData
  });
  
  await log.populate('mr', 'personalInfo.name employeeId');
  ApiResponse.created(res, 'Performance log created successfully', log);
});

const updatePerformanceLog = asyncHandler(async (req, res) => {
  const log = await MRPerformanceLog.findById(req.params.id);
  if (!log) return ApiResponse.notFound(res, 'Performance log not found');
  
  Object.assign(log, req.body);
  await log.save();
  
  ApiResponse.success(res, 'Performance log updated successfully', log);
});

const verifyPerformanceLog = asyncHandler(async (req, res) => {
  const log = await MRPerformanceLog.findById(req.params.id);
  if (!log) return ApiResponse.notFound(res, 'Performance log not found');
  
  log.status = 'Verified';
  log.verified_by = req.user._id;
  log.verified_at = new Date();
  
  await log.save();
  ApiResponse.success(res, 'Performance log verified successfully', log);
});

const deletePerformanceLog = asyncHandler(async (req, res) => {
  const log = await MRPerformanceLog.findById(req.params.id);
  if (!log) return ApiResponse.notFound(res, 'Performance log not found');
  
  await log.deleteOne();
  ApiResponse.success(res, 'Performance log deleted successfully');
});

module.exports = {
  getAllPerformanceLogs,
  getPerformanceLogById,
  createPerformanceLog,
  updatePerformanceLog,
  verifyPerformanceLog,
  deletePerformanceLog
};
