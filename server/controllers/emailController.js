const emailService = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Send generic email
 * @route   POST /api/email/send
 * @access  Private (Admin only)
 */
const sendEmail = asyncHandler(async (req, res) => {
  const { to, subject, htmlContent } = req.body;

  if (!to || !subject || !htmlContent) {
    return ApiResponse.badRequest(res, 'Missing required fields: to, subject, htmlContent');
  }

  const result = await emailService.sendEmail(to, subject, htmlContent);

  if (result.success) {
    return ApiResponse.success(res, 'Email sent successfully', result);
  } else {
    return ApiResponse.error(res, 'Failed to send email', result);
  }
});

/**
 * @desc    Send approval email
 * @route   POST /api/email/approval
 * @access  Private (Admin only)
 */
const sendApprovalEmail = asyncHandler(async (req, res) => {
  const { email, tempPassword } = req.body;

  if (!email || !tempPassword) {
    return ApiResponse.badRequest(res, 'Missing required fields: email, tempPassword');
  }

  const result = await emailService.sendApprovalEmail(email, tempPassword);

  if (result.success) {
    return ApiResponse.success(res, 'Approval email sent successfully', result);
  } else {
    return ApiResponse.error(res, 'Failed to send approval email', result);
  }
});

/**
 * @desc    Send rejection email
 * @route   POST /api/email/rejection
 * @access  Private (Admin only)
 */
const sendRejectionEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return ApiResponse.badRequest(res, 'Missing required field: email');
  }

  const result = await emailService.sendRejectionEmail(email);

  if (result.success) {
    return ApiResponse.success(res, 'Rejection email sent successfully', result);
  } else {
    return ApiResponse.error(res, 'Failed to send rejection email', result);
  }
});

/**
 * @desc    Send application received email
 * @route   POST /api/email/application-received
 * @access  Public
 */
const sendApplicationReceivedEmail = asyncHandler(async (req, res) => {
  const { name, email, phone, area } = req.body;

  if (!name || !email || !phone || !area) {
    return ApiResponse.badRequest(res, 'Missing required fields: name, email, phone, area');
  }

  const result = await emailService.sendApplicationReceivedEmail(name, email, phone, area);

  if (result.success) {
    return ApiResponse.success(res, 'Application received email sent successfully', result);
  } else {
    return ApiResponse.error(res, 'Failed to send application received email', result);
  }
});

module.exports = {
  sendEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendApplicationReceivedEmail
};
