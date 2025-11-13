const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrMR } = require('../middleware/roleMiddleware');
const {
  getAllActivities,
  getActivityById,
  createActivity,
  getProductAnalytics
} = require('../controllers/productActivityController');

router.use(authMiddleware);

router.get('/', isAdminOrMR, getAllActivities);
router.get('/:id', isAdminOrMR, getActivityById);
router.post('/', isAdminOrMR, createActivity);
router.get('/analytics/product/:productId', isAdmin, getProductAnalytics);

module.exports = router;
