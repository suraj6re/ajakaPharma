import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getStockists, getProducts, submitStockistOrder } from '../services/api';
import { useAuth } from '../services/AuthContext';

const StockistOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    stockistId: '',
    productId: '',
    quantity: '',
    status: 'Pending',
    priority: 'Normal',
    notes: '',
    deliveryDate: '',
    orderType: 'Regular'
  });

  const [stockists, setStockists] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, stockistsRes] = await Promise.all([
          getProducts(),
          getStockists()
        ]);
        
        setProducts(productsRes.data.data || []);
        setStockists(stockistsRes.data.data || []);
        
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setSuccess('');
  };

  const calculateTotalAmount = () => {
    if (formData.productId && formData.quantity) {
      const selectedProduct = products.find(p => p._id === formData.productId);
      return selectedProduct ? (selectedProduct.price || 0) * parseInt(formData.quantity) : 0;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { createOrder } = await import('../services/api');
      const selectedStockist = stockists.find(s => s.id === parseInt(formData.stockistId));
      const selectedProduct = products.find(p => p._id === formData.productId);
      const totalAmount = selectedProduct ? selectedProduct.price * parseInt(formData.quantity) : 0;

      const orderData = {
        mr: user._id || user.id,
        orderType: 'stockist',
        items: [{
          product: formData.productId,
          quantity: parseInt(formData.quantity)
        }],
        totalAmount,
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes,
        deliveryDate: formData.deliveryDate || undefined,
        stockistName: selectedStockist?.name
      };

      const response = await createOrder(orderData);
      setOrders([response.data.data, ...orders]);

      setSuccess('Order placed successfully! 🎉');
      setFormData({
        stockistId: '',
        productId: '',
        quantity: '',
        status: 'Pending',
        priority: 'Normal',
        notes: '',
        deliveryDate: '',
        orderType: 'Regular'
      });

      setTimeout(() => {
        navigate('/mr-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting order:', error);
      setError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <Sidebar />

      <main className="ml-64 pt-16 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">New Stockist Order 🛒</h1>
            <p className="text-gray-600 mt-1">
              Place orders for products from stockists
            </p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Form */}
              <div className="lg:col-span-2">
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Details</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="stockistId" className="form-label">
                          Stockist *
                        </label>
                        <select
                          id="stockistId"
                          name="stockistId"
                          required
                          value={formData.stockistId}
                          onChange={handleChange}
                          className="form-input"
                        >
                          <option value="">Select a stockist</option>
                          {stockists.map((stockist) => (
                            <option key={stockist.id} value={stockist.id}>
                              {stockist.name} - {stockist.location}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="productId" className="form-label">
                          Product *
                        </label>
                        <select
                          id="productId"
                          name="productId"
                          required
                          value={formData.productId}
                          onChange={handleChange}
                          className="form-input"
                        >
                          <option value="">Select a product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.product_name || product.name} - ₹{product.price || 0}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="quantity" className="form-label">
                          Quantity *
                        </label>
                        <input
                          id="quantity"
                          name="quantity"
                          type="number"
                          min="1"
                          required
                          value={formData.quantity}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter quantity"
                        />
                      </div>

                      <div>
                        <label htmlFor="orderType" className="form-label">
                          Order Type
                        </label>
                        <select
                          id="orderType"
                          name="orderType"
                          value={formData.orderType}
                          onChange={handleChange}
                          className="form-input"
                        >
                          <option value="Regular">Regular Order</option>
                          <option value="Emergency">Emergency Order</option>
                          <option value="Sample">Sample Request</option>
                          <option value="Bulk">Bulk Order</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="priority" className="form-label">
                          Priority
                        </label>
                        <select
                          id="priority"
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="form-input"
                        >
                          <option value="Low">Low</option>
                          <option value="Normal">Normal</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="deliveryDate" className="form-label">
                          Expected Delivery Date
                        </label>
                        <input
                          id="deliveryDate"
                          name="deliveryDate"
                          type="date"
                          value={formData.deliveryDate}
                          onChange={handleChange}
                          className="form-input"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label htmlFor="status" className="form-label">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="form-input"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="notes" className="form-label">
                        Additional Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="form-input"
                        rows="3"
                        placeholder="Any special instructions or notes for this order..."
                      />
                    </div>

                    {/* Order Summary */}
                    {formData.productId && formData.quantity && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Order Summary</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p><strong>Product:</strong> {products.find(p => p._id === formData.productId)?.product_name || products.find(p => p._id === formData.productId)?.name}</p>
                          <p><strong>Quantity:</strong> {formData.quantity} units</p>
                          <p><strong>Unit Price:</strong> ₹{products.find(p => p._id === formData.productId)?.price || 0}</p>
                          <p className="text-lg font-semibold"><strong>Total Amount: ₹{calculateTotalAmount().toLocaleString()}</strong></p>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Placing Order...
                          </>
                        ) : (
                          '🛒 Place Order'
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/mr-dashboard')}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>

                  </form>
                </div>
              </div>

              {/* Recent Orders Sidebar */}
              <div className="lg:col-span-1">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                  {orders.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {orders.slice(0, 8).map((order) => (
                        <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900">{order.productName}</h4>
                          <p className="text-sm text-gray-600">{order.stockistName}</p>
                          <p className="text-xs text-gray-500">Qty: {order.quantity} • ₹{order.totalAmount?.toLocaleString()}</p>
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No orders placed yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StockistOrder;
