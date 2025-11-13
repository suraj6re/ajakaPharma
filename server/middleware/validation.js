const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserCreation = [
  body('personalInfo.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('personalInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('employeeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  body('workInfo.role')
    .isIn(['MR', 'Admin', 'Manager'])
    .withMessage('Role must be MR, Admin, or Manager'),
  handleValidationErrors
];

// Doctor validation rules
const validateDoctorCreation = [
  body('personalInfo.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Doctor name must be between 2 and 100 characters'),
  body('contactInfo.address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City is required and must be between 2 and 50 characters'),
  body('personalInfo.specialization')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Specialization must not exceed 100 characters'),
  body('contactInfo.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

// Product validation rules
const validateProductCreation = [
  body('basicInfo.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('basicInfo.category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category is required and must be between 2 and 50 characters'),
  body('businessInfo.mrp')
    .isFloat({ min: 0 })
    .withMessage('MRP must be a positive number'),
  body('medicalInfo.composition')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Composition must not exceed 500 characters'),
  handleValidationErrors
];

// Visit report validation rules
const validateVisitReport = [
  body('doctor')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('interaction.notes')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Notes must be between 10 and 1000 characters'),
  body('visitDetails.visitDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('interaction.productsDiscussed')
    .optional()
    .isArray()
    .withMessage('Products discussed must be an array'),
  body('interaction.productsDiscussed.*.product')
    .optional()
    .isMongoId()
    .withMessage('Each product must have a valid ID'),
  body('orders')
    .optional()
    .isArray()
    .withMessage('Orders must be an array'),
  body('orders.*.product')
    .optional()
    .isMongoId()
    .withMessage('Each order must have a valid product ID'),
  body('orders.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order quantity must be a positive integer'),
  handleValidationErrors
];

// Order validation rules
const validateOrder = [
  body('doctor')
    .optional()
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Each item must have a valid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be a positive integer'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  handleValidationErrors
];

// Query validation for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateUserCreation,
  validateDoctorCreation,
  validateProductCreation,
  validateVisitReport,
  validateOrder,
  validateObjectId,
  validatePagination,
  handleValidationErrors
};