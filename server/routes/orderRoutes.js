const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isAdminOrMR } = require('../middleware/roleMiddleware');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

router.use(authMiddleware);

router.get('/', isAdminOrMR, getAllOrders);
router.get('/:id', isAdminOrMR, getOrderById);
router.post('/', isAdminOrMR, createOrder);
router.put('/:id', isAdminOrMR, updateOrder);
router.delete('/:id', isAdminOrMR, deleteOrder);

module.exports = router;
