const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin, isMR, isAdminOrMR } = require('../middleware/roleMiddleware');
const {
  getAllVisitReports,
  getVisitReportById,
  createVisitReport,
  updateVisitReport,
  deleteVisitReport,
  approveVisitReport,
  rejectVisitReport
} = require('../controllers/visitReportController');

router.use(authMiddleware);

router.get('/', isAdminOrMR, getAllVisitReports);
router.get('/:id', isAdminOrMR, getVisitReportById);
router.post('/', isMR, createVisitReport);
router.put('/:id', isAdminOrMR, updateVisitReport);
router.delete('/:id', isAdminOrMR, deleteVisitReport);
router.post('/:id/approve', isAdmin, approveVisitReport);
router.post('/:id/reject', isAdmin, rejectVisitReport);

module.exports = router;
