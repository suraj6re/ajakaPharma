const { Order } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getAllOrders = asyncHandler(async (req, res) => {
  const { status, orderType, startDate, endDate } = req.query;
  const query = {};
  
  const userRole = req.user.role;
  if (userRole?.toLowerCase() === 'mr') {
    query.mr = req.user._id;
  }
  
  if (status) query.status = status;
  if (orderType) query['orderDetails.orderType'] = orderType;
  if (startDate || endDate) {
    query['orderDetails.orderDate'] = {};
    if (startDate) query['orderDetails.orderDate'].$gte = new Date(startDate);
    if (endDate) query['orderDetails.orderDate'].$lte = new Date(endDate);
  }
  
  const orders = await Order.find(query)
    .populate('mr', 'name employeeId')
    .populate('doctor', 'name')
    .populate('items.product', 'name')
    .populate('visitReport')
    .sort({ createdAt: -1 });
  
  ApiResponse.success(res, 'Orders retrieved successfully', { count: orders.length, orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('mr', 'name email role')
    .populate('doctor', 'name email phone')
    .populate('items.product', 'name')
    .populate('visitReport');
  
  if (!order) return ApiResponse.notFound(res, 'Order not found');
  
  const userRole = req.user.role;
  if (userRole?.toLowerCase() === 'mr' && order.mr._id.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied');
  }
  
  ApiResponse.success(res, 'Order retrieved successfully', order);
});

const createOrder = asyncHandler(async (req, res) => {
  const { doctor, visitReport, orderDetails, items, delivery } = req.body;
  
  const order = await Order.create({
    mr: req.user._id,
    doctor,
    visitReport,
    orderDetails,
    items,
    delivery
  });
  
  await order.populate([
    { path: 'mr', select: 'name' },
    { path: 'doctor', select: 'name' },
    { path: 'items.product', select: 'name' }
  ]);
  
  ApiResponse.created(res, 'Order created successfully', order);
});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return ApiResponse.notFound(res, 'Order not found');
  
  const userRole = req.user.role;
  if (userRole?.toLowerCase() === 'mr' && order.mr.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied');
  }
  
  const { orderDetails, items, delivery, status, notes } = req.body;
  
  if (orderDetails) Object.assign(order.orderDetails, orderDetails);
  if (items) order.items = items;
  if (delivery) Object.assign(order.delivery, delivery);
  if (notes) order.notes = notes;
  
  if (status && userRole?.toLowerCase() === 'admin') {
    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: req.user._id,
      notes: req.body.statusNotes
    });
  }
  
  await order.save();
  ApiResponse.success(res, 'Order updated successfully', order);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return ApiResponse.notFound(res, 'Order not found');
  
  const userRole = req.user.role;
  if (userRole?.toLowerCase() === 'mr') {
    if (order.mr.toString() !== req.user._id.toString() || order.status !== 'Pending') {
      return ApiResponse.forbidden(res, 'Cannot delete this order');
    }
  }
  
  await order.deleteOne();
  ApiResponse.success(res, 'Order deleted successfully');
});

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};
