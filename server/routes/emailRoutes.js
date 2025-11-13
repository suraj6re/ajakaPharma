const express = require('express');
const router = express.Router();
const {
  sendEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendApplicationReceivedEmail
} = require('../controllers/emailController');
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Admin only routes
router.post('/send', authMiddleware, isAdmin, sendEmail);
router.post('/approval', authMiddleware, isAdmin, sendApprovalEmail);
router.post('/rejection', authMiddleware, isAdmin, sendRejectionEmail);

// Public route (for application form)
router.post('/application-received', sendApplicationReceivedEmail);

module.exports = router;
