const { Doctor } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all doctors
 * @route   GET /api/doctors
 * @access  Private (Admin or MR)
 */
const getAllDoctors = asyncHandler(async (req, res) => {
  const { specialization, city, place, search, assignedToMe, assignedMR } = req.query;
  
  // Build query
  const query = {}; // Removed isActive filter - all doctors have default true value
  
  if (specialization) {
    query.specialization = { $regex: specialization, $options: 'i' };
  }
  
  if (city || place) {
    query.place = { $regex: city || place, $options: 'i' };
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { qualification: { $regex: search, $options: 'i' } },
      { place: { $regex: search, $options: 'i' } }
    ];
  }
  
  // If MR requests only their assigned doctors
  const userRole = req.user.role;
  if (assignedToMe === 'true') {
    query.assignedMR = req.user._id;
  }
  // Note: Removed automatic filtering for MR role to allow them to see all doctors
  
  // Filter by specific MR
  if (assignedMR) {
    query.assignedMR = assignedMR;
  }
  
  const doctors = await Doctor.find(query)
    .populate('assignedMR', 'name employeeId')
    .select('-__v')
    .sort({ srNo: 1 });
  
  ApiResponse.success(res, 'Doctors retrieved successfully', {
    count: doctors.length,
    doctors
  });
});

/**
 * @desc    Get doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Private
 */
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('assignedMRs', 'personalInfo.name employeeId workInfo.territory')
    .populate('preferences.preferredProducts', 'basicInfo.name productId')
    .select('-__v');
  
  if (!doctor) {
    return ApiResponse.notFound(res, 'Doctor not found');
  }
  
  // Check if MR has access to this doctor
  const userRole = req.user.workInfo?.role || req.user.role;
  if (userRole?.toLowerCase() === 'mr') {
    const isAssigned = doctor.assignedMRs.some(mr => mr._id.toString() === req.user._id.toString());
    if (!isAssigned) {
      return ApiResponse.forbidden(res, 'Access denied. Doctor not assigned to you.');
    }
  }
  
  ApiResponse.success(res, 'Doctor retrieved successfully', doctor);
});

/**
 * @desc    Create new doctor
 * @route   POST /api/doctors
 * @access  Private (Admin or MR)
 */
const createDoctor = asyncHandler(async (req, res) => {
  const { name, qualification, place, specialization, phone, email } = req.body;
  
  // Check if doctor already exists
  if (phone) {
    const existingDoctor = await Doctor.findOne({ phone });
    if (existingDoctor) {
      return ApiResponse.badRequest(res, 'Doctor with this phone number already exists');
    }
  }
  
  // If MR creates doctor, auto-assign to them
  const userRole = req.user.workInfo?.role || req.user.role;
  const assignedMR = userRole?.toLowerCase() === 'mr' ? req.user._id : req.body.assignedMR;
  
  const doctor = await Doctor.create({
    name,
    qualification,
    place,
    specialization,
    phone,
    email,
    assignedMR
  });
  
  await doctor.populate('assignedMR', 'personalInfo.name employeeId');
  
  ApiResponse.created(res, 'Doctor created successfully', doctor);
});

/**
 * @desc    Update doctor
 * @route   PUT /api/doctors/:id
 * @access  Private (Admin or assigned MR)
 */
const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  
  if (!doctor) {
    return ApiResponse.notFound(res, 'Doctor not found');
  }
  
  // Check if MR has access to this doctor
  const userRole = req.user.workInfo?.role || req.user.role;
  if (userRole?.toLowerCase() === 'mr') {
    const isAssigned = doctor.assignedMRs.some(mr => mr.toString() === req.user._id.toString());
    if (!isAssigned) {
      return ApiResponse.forbidden(res, 'Access denied. Doctor not assigned to you.');
    }
  }
  
  const { personalInfo, contactInfo, practiceInfo, preferences, assignedMRs, isActive } = req.body;
  
  if (personalInfo) Object.assign(doctor.personalInfo, personalInfo);
  if (contactInfo) {
    if (contactInfo.address) {
      Object.assign(doctor.contactInfo.address, contactInfo.address);
    }
    if (contactInfo.phone) doctor.contactInfo.phone = contactInfo.phone;
    if (contactInfo.email) doctor.contactInfo.email = contactInfo.email;
  }
  if (practiceInfo) Object.assign(doctor.practiceInfo, practiceInfo);
  if (preferences) Object.assign(doctor.preferences, preferences);
  
  // Only admin can change assignments and active status
  if (userRole?.toLowerCase() === 'admin') {
    if (assignedMRs) doctor.assignedMRs = assignedMRs;
    if (isActive !== undefined) doctor.isActive = isActive;
  }
  
  await doctor.save();
  await doctor.populate('assignedMRs', 'personalInfo.name employeeId');
  
  ApiResponse.success(res, 'Doctor updated successfully', doctor);
});

/**
 * @desc    Delete doctor (soft delete)
 * @route   DELETE /api/doctors/:id
 * @access  Admin
 */
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  
  if (!doctor) {
    return ApiResponse.notFound(res, 'Doctor not found');
  }
  
  // Soft delete
  doctor.isActive = false;
  await doctor.save();
  
  ApiResponse.success(res, 'Doctor deactivated successfully');
});

/**
 * @desc    Assign MR to doctor
 * @route   POST /api/doctors/:id/assign-mr
 * @access  Admin
 */
const assignMRToDoctor = asyncHandler(async (req, res) => {
  const { mrId } = req.body;
  
  const doctor = await Doctor.findById(req.params.id);
  
  if (!doctor) {
    return ApiResponse.notFound(res, 'Doctor not found');
  }
  
  // Check if MR already assigned
  if (doctor.assignedMRs.includes(mrId)) {
    return ApiResponse.badRequest(res, 'MR already assigned to this doctor');
  }
  
  doctor.assignedMRs.push(mrId);
  await doctor.save();
  await doctor.populate('assignedMRs', 'personalInfo.name employeeId');
  
  ApiResponse.success(res, 'MR assigned successfully', doctor);
});

/**
 * @desc    Remove MR from doctor
 * @route   DELETE /api/doctors/:id/remove-mr/:mrId
 * @access  Admin
 */
const removeMRFromDoctor = asyncHandler(async (req, res) => {
  const { id, mrId } = req.params;
  
  const doctor = await Doctor.findById(id);
  
  if (!doctor) {
    return ApiResponse.notFound(res, 'Doctor not found');
  }
  
  doctor.assignedMRs = doctor.assignedMRs.filter(mr => mr.toString() !== mrId);
  await doctor.save();
  
  ApiResponse.success(res, 'MR removed successfully');
});

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  assignMRToDoctor,
  removeMRFromDoctor
};
