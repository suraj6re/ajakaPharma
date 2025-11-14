const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const {
  submitRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  deleteRequest
} = require('../controllers/mrRequestController');

// Public route - submit MR request
router.post('/', submitRequest);

// Protected routes - Admin only
router.use(authMiddleware);
router.use(isAdmin);

router.get('/', getAllRequests);
router.get('/:id', getRequestById);
router.put('/:id/approve', approveRequest);
router.put('/:id/reject', rejectRequest);
router.delete('/:id', deleteRequest);

module.exports = router;
