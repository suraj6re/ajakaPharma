const express = require('express');
const router = express.Router();

const Doctor = require('../models/Doctor');
const { authenticateToken, authorizeRoles, authorizeMRAccess } = require('../middleware/auth');
const { validateDoctorCreation, validatePagination, validateObjectId } = require('../middleware/validation');
const { catchAsync, AppError } = require('../middleware/errorHandler');

// @route   GET /api/v1/doctors
// @desc    Get all doctors with filtering and pagination
// @access  Private
router.get('/', 
  authenticateToken,
  validatePagination,
  catchAsync(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      city, 
      specialization, 
      search,
      assignedToMR 
    } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (city) {
      filter['contactInfo.address.city'] = new RegExp(city, 'i');
    }
    
    if (specialization) {
      filter.$or = [
        { 'personalInfo.specialization': new RegExp(specialization, 'i') },
        { 'personalInfo.specialty': new RegExp(specialization, 'i') }
      ];
    }
    
    if (search) {
      filter.$or = [
        { 'personalInfo.name': new RegExp(search, 'i') },
        { 'practiceInfo.hospitalName': new RegExp(search, 'i') },
        { 'practiceInfo.clinicName': new RegExp(search, 'i') }
      ];
    }
    
    if (assignedToMR) {
      filter.assignedMRs = assignedToMR;
    }

    const skip = (page - 1) * limit;
    
    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select('-__v')
        .sort({ 'personalInfo.name': 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedMRs', 'personalInfo.name employeeId')
        .populate('preferences.preferredProducts', 'basicInfo.name'),
      Doctor.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalDoctors: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  })
);

// @route   GET /api/v1/doctors/:id
// @desc    Get doctor by ID
// @access  Private
router.get('/:id', 
  authenticateToken,
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id)
      .populate('assignedMRs', 'personalInfo.name employeeId workInfo.territory')
      .populate('preferences.preferredProducts', 'basicInfo.name basicInfo.category');

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    res.json({
      success: true,
      data: { doctor }
    });
  })
);

// @route   POST /api/v1/doctors
// @desc    Create new doctor
// @access  Private (MR can create, Admin can create)
router.post('/', 
  authenticateToken,
  validateDoctorCreation,
  catchAsync(async (req, res) => {
    const doctorData = { ...req.body };
    
    // If MR is creating, auto-assign themselves
    if (req.user.workInfo.role === 'MR') {
      doctorData.assignedMRs = [req.user._id];
    }

    const doctor = new Doctor(doctorData);
    await doctor.save();

    await doctor.populate('assignedMRs', 'personalInfo.name employeeId');

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: { doctor }
    });
  })
);

// @route   PUT /api/v1/doctors/:id
// @desc    Update doctor
// @access  Private (Admin or assigned MR)
router.put('/:id', 
  authenticateToken,
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    // Check if MR is authorized to update this doctor
    if (req.user.workInfo.role === 'MR') {
      const isAssigned = doctor.assignedMRs.some(mrId => 
        mrId.toString() === req.user._id.toString()
      );
      
      if (!isAssigned) {
        throw new AppError('You can only update doctors assigned to you', 403);
      }
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('assignedMRs', 'personalInfo.name employeeId');

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: { doctor: updatedDoctor }
    });
  })
);

// @route   DELETE /api/v1/doctors/:id
// @desc    Deactivate doctor (Admin only)
// @access  Private/Admin
router.delete('/:id', 
  authenticateToken,
  authorizeRoles('Admin'),
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    res.json({
      success: true,
      message: 'Doctor deactivated successfully'
    });
  })
);

// @route   POST /api/v1/doctors/:id/assign-mr
// @desc    Assign MR to doctor (Admin only)
// @access  Private/Admin
router.post('/:id/assign-mr', 
  authenticateToken,
  authorizeRoles('Admin'),
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const { mrId } = req.body;
    
    if (!mrId) {
      throw new AppError('MR ID is required', 400);
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedMRs: mrId } },
      { new: true }
    ).populate('assignedMRs', 'personalInfo.name employeeId');

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    res.json({
      success: true,
      message: 'MR assigned to doctor successfully',
      data: { doctor }
    });
  })
);

// @route   DELETE /api/v1/doctors/:id/unassign-mr/:mrId
// @desc    Unassign MR from doctor (Admin only)
// @access  Private/Admin
router.delete('/:id/unassign-mr/:mrId', 
  authenticateToken,
  authorizeRoles('Admin'),
  validateObjectId('id'),
  validateObjectId('mrId'),
  catchAsync(async (req, res) => {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $pull: { assignedMRs: req.params.mrId } },
      { new: true }
    ).populate('assignedMRs', 'personalInfo.name employeeId');

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    res.json({
      success: true,
      message: 'MR unassigned from doctor successfully',
      data: { doctor }
    });
  })
);

// @route   GET /api/v1/doctors/cities/list
// @desc    Get list of all cities where doctors are located
// @access  Private
router.get('/cities/list', 
  authenticateToken,
  catchAsync(async (req, res) => {
    const cities = await Doctor.distinct('contactInfo.address.city', { isActive: true });
    
    res.json({
      success: true,
      data: { cities: cities.filter(Boolean).sort() }
    });
  })
);

// @route   GET /api/v1/doctors/specializations/list
// @desc    Get list of all specializations
// @access  Private
router.get('/specializations/list', 
  authenticateToken,
  catchAsync(async (req, res) => {
    const [specializations, specialties] = await Promise.all([
      Doctor.distinct('personalInfo.specialization', { isActive: true }),
      Doctor.distinct('personalInfo.specialty', { isActive: true })
    ]);
    
    const allSpecializations = [...new Set([...specializations, ...specialties])]
      .filter(Boolean)
      .sort();
    
    res.json({
      success: true,
      data: { specializations: allSpecializations }
    });
  })
);

module.exports = router;