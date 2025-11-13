const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrMR } = require('../middleware/roleMiddleware');
const {
  getAllPerformanceLogs,
  getPerformanceLogById,
  createPerformanceLog,
  updatePerformanceLog,
  verifyPerformanceLog,
  deletePerformanceLog
} = require('../controllers/mrPerformanceController');

router.use(authMiddleware);

router.get('/', isAdminOrMR, getAllPerformanceLogs);
router.get('/:id', isAdminOrMR, getPerformanceLogById);
router.post('/', isAdmin, createPerformanceLog);
router.put('/:id', isAdmin, updatePerformanceLog);
router.post('/:id/verify', isAdmin, verifyPerformanceLog);
router.delete('/:id', isAdmin, deletePerformanceLog);

module.exports = router;
