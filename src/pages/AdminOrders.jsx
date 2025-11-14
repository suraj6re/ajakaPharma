import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  PhoneIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { getVisitReports, updateVisitReport } from '../services/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({ search: '', mrId: '', status: '', from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filters.from, filters.to]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.from) params.startDate = filters.from;
      if (filters.to) params.endDate = filters.to;
      
      const response = await getVisitReports(params);
      const visits = response.data?.data?.visits || response.data?.data || response.data || [];
      
      // Extract orders from visit reports
      const allOrders = [];
      visits.forEach(visit => {
        if (visit.orders && visit.orders.length > 0) {
          visit.orders.forEach(order => {
            allOrders.push({
              ...order,
              visitId: visit.visitId || visit._id,
              visitDate: visit.visitDetails?.visitDate || visit.visitDate,
              mr: visit.mr,
              doctor: visit.doctor,
              visitStatus: visit.status
            });
          });
        }
      });
      
      setOrders(allOrders);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error(error.response?.data?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...orders];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(order => 
        order.doctor?.name?.toLowerCase().includes(search) ||
        order.mr?.name?.toLowerCase().includes(search) ||
        order.product?.basicInfo?.name?.toLowerCase().includes(search) ||
        order.product?.name?.toLowerCase().includes(search)
      );
    }
    
    if (filters.mrId) {
      data = data.filter(order => (order.mr?._id || order.mr) === filters.mrId);
    }
    
    if (filters.status) {
      data = data.filter(order => order.status === filters.status);
    }
    
    setFilteredOrders(data);
  }, [filters.search, filters.mrId, filters.status, orders]);

  const uniqueMRs = [...new Map(orders.map(o => [o.mr?._id, o.mr]).filter(([id]) => id)).values()];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error('No orders to export');
      return;
    }

    const headers = ['Order Date', 'Visit ID', 'MR Name', 'Doctor Name', 'Product', 'Quantity', 'Unit Price', 'Total Amount', 'Status'];
    const csvRows = [headers.join(',')];
    
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.visitDate).toLocaleDateString();
      const visitId = order.visitId || 'N/A';
      const mrName = order.mr?.name || 'N/A';
      const doctorName = order.doctor?.name || 'N/A';
      const productName = order.product?.basicInfo?.name || order.product?.name || 'N/A';
      const quantity = order.quantity || 0;
      const unitPrice = order.unitPrice || 0;
      const totalAmount = order.totalAmount || (quantity * unitPrice);
      const status = order.status || 'Pending';
      
      csvRows.push([
        `"${orderDate}"`,
        `"${visitId}"`,
        `"${mrName}"`,
        `"${doctorName}"`,
        `"${productName}"`,
        quantity,
        unitPrice,
        totalAmount,
        `"${status}"`
      ].join(','));
    });
    
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredOrders.length} orders`);
  };

  const totalOrderValue = filteredOrders.reduce((sum, order) => {
    const amount = order.totalAmount || (order.quantity * (order.unitPrice || 0));
    return sum + amount;
  }, 0);

  const totalQuantity = filteredOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);

  const updateOrderStatus = async (order, newStatus) => {
    try {
      // Find the visit report this order belongs to
      const visitId = order.visitId;
      
      // Get the full visit report
      const response = await getVisitReports();
      const visits = response.data?.data?.visits || response.data?.data || response.data || [];
      const visit = visits.find(v => (v.visitId || v._id) === visitId);
      
      if (!visit) {
        toast.error('Visit report not found');
        return;
      }

      // Update the specific order status in the orders array
      const updatedOrders = visit.orders.map(o => {
        // Match by product ID and quantity to find the right order
        if (o.product === order.product._id && o.quantity === order.quantity) {
          return { ...o, status: newStatus };
        }
        return o;
      });

      // Update the visit report with new orders
      await updateVisitReport(visit._id, { orders: updatedOrders });
      
      toast.success(`Order status updated to ${newStatus}`);
      
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <AdminSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <ShoppingCartIcon className="w-8 h-8 mr-3 text-primary-600" />
                  Orders Management
                </h1>
                <p className="text-gray-600 mt-1">View and manage all orders from visit reports</p>
              </div>
              <button
                onClick={exportToCSV}
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{filteredOrders.length}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <p className="text-sm font-medium text-gray-600">Total Quantity</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalQuantity}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">₹{totalOrderValue.toLocaleString()}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <p className="text-sm font-medium text-gray-600">Unique Products</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {new Set(filteredOrders.map(o => o.product?._id || o.product)).size}
              </p>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6"
          >
            <div className="flex items-center mb-4">
              <FunnelIcon className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search product, doctor, or MR..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <select
                value={filters.mrId}
                onChange={(e) => setFilters({ ...filters, mrId: e.target.value })}
                className="form-input"
              >
                <option value="">All MRs</option>
                {uniqueMRs.map(mr => (
                  <option key={mr._id} value={mr._id}>{mr.name || mr.email}</option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="form-input"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                className="form-input"
                placeholder="From Date"
              />
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                className="form-input"
                placeholder="To Date"
              />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
              <button
                onClick={() => setFilters({ search: '', mrId: '', status: '', from: '', to: '' })}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>

          {/* Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MR</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.visitDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.visitId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.mr?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.mr?.employeeId || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.doctor?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.doctor?.place || ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {order.product?.basicInfo?.name || order.product?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.quantity || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{(order.unitPrice || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{(order.totalAmount || (order.quantity * (order.unitPrice || 0))).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status || 'Pending')}`}>
                            {getStatusIcon(order.status || 'Pending')}
                            <span className="ml-1">{order.status || 'Pending'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailsModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-xs transition-colors"
                              title="View order details"
                            >
                              <EyeIcon className="w-3 h-3 mr-1" />
                              Details
                            </button>
                            {(order.status === 'Pending' || !order.status) && (
                              <>
                                <button
                                  onClick={() => updateOrderStatus(order, 'Confirmed')}
                                  className="inline-flex items-center px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-xs transition-colors"
                                  title="Confirm order with stockist"
                                >
                                  <PhoneIcon className="w-3 h-3 mr-1" />
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(order, 'Cancelled')}
                                  className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs transition-colors"
                                  title="Cancel order"
                                >
                                  <XCircleIcon className="w-3 h-3 mr-1" />
                                  Cancel
                                </button>
                              </>
                            )}
                            {order.status === 'Confirmed' && (
                              <button
                                onClick={() => updateOrderStatus(order, 'Shipped')}
                                className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs transition-colors"
                                title="Mark as shipped"
                              >
                                <TruckIcon className="w-3 h-3 mr-1" />
                                Ship
                              </button>
                            )}
                            {order.status === 'Shipped' && (
                              <button
                                onClick={() => updateOrderStatus(order, 'Delivered')}
                                className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs transition-colors"
                                title="Mark as delivered"
                              >
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Deliver
                              </button>
                            )}
                            {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                              <span className="text-xs text-gray-500 italic">No actions</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No orders found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {filters.search || filters.mrId || filters.status ? 'Try adjusting your filters' : 'Orders will appear here when MRs submit visit reports with orders'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <ShoppingCartIcon className="w-6 h-6 mr-2 text-primary-600" />
                Order Details
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Visit ID</p>
                    <p className="font-medium text-gray-900">{selectedOrder.visitId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedOrder.visitDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status || 'Pending')}`}>
                      {selectedOrder.status || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <p className="font-medium text-gray-900">{selectedOrder.priority || 'Medium'}</p>
                  </div>
                </div>
              </div>

              {/* MR Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Medical Representative</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{selectedOrder.mr?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Employee ID</p>
                    <p className="font-medium text-gray-900">{selectedOrder.mr?.employeeId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedOrder.mr?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedOrder.mr?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Doctor/Delivery Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Delivery To (Doctor)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Doctor Name</p>
                    <p className="font-medium text-gray-900">{selectedOrder.doctor?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Qualification</p>
                    <p className="font-medium text-gray-900">{selectedOrder.doctor?.qualification || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{selectedOrder.doctor?.place || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedOrder.doctor?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Product Name</p>
                    <p className="font-medium text-gray-900 text-lg">
                      {selectedOrder.product?.basicInfo?.name || selectedOrder.product?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-bold text-gray-900 text-xl">{selectedOrder.quantity || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unit Price</p>
                      <p className="font-bold text-gray-900 text-xl">₹{(selectedOrder.unitPrice || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-primary-600 text-xl">
                        ₹{(selectedOrder.totalAmount || (selectedOrder.quantity * (selectedOrder.unitPrice || 0))).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.product?.basicInfo?.category && (
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-medium text-gray-900">{selectedOrder.product.basicInfo.category}</p>
                    </div>
                  )}
                  {selectedOrder.product?.medicalInfo?.composition && (
                    <div>
                      <p className="text-sm text-gray-600">Composition</p>
                      <p className="font-medium text-gray-900">{selectedOrder.product.medicalInfo.composition}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Order Notes</h3>
                  <p className="text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
