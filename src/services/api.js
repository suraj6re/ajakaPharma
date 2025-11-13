// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ USER ENDPOINTS ============
// ============ AUTH ENDPOINTS ============
export const loginUser = (credentials) => api.post('/users/login', credentials);

// ============ USER ENDPOINTS ============
export const getUsers = (params) => api.get('/users', { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (userData) => api.post('/users', userData);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ============ DOCTOR ENDPOINTS ============
export const getAllDoctors = () => api.get('/doctors');
export const getDoctorById = (id) => api.get(`/doctors/${id}`);
export const addDoctorAdmin = (doctorData) => api.post('/doctors', doctorData);
export const updateDoctorAdmin = (doctorId, doctorData) => api.put(`/doctors/${doctorId}`, doctorData);
export const deleteDoctorAdmin = (doctorId) => api.delete(`/doctors/${doctorId}`);
export const getDoctorsForMR = (mrId) => api.get(`/doctors?assignedMR=${mrId}`);
export const addDoctorForMR = (doctorData) => api.post('/doctors', doctorData);

// ============ PRODUCT ENDPOINTS ============
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const addProduct = (productData) => api.post('/products', productData);
export const updateProduct = (productId, productData) => api.put(`/products/${productId}`, productData);
export const deleteProduct = (productId) => api.delete(`/products/${productId}`);

// ============ VISIT REPORT ENDPOINTS ============
export const getVisitReports = (params) => api.get('/visit-reports', { params });
export const getVisitReportById = (id) => api.get(`/visit-reports/${id}`);
export const submitVisit = (visitData) => api.post('/visit-reports', visitData);
export const updateVisitReport = (id, visitData) => api.put(`/visit-reports/${id}`, visitData);
export const deleteVisitReport = (id) => api.delete(`/visit-reports/${id}`);

// ============ ORDER ENDPOINTS ============
export const getOrders = (params) => api.get('/orders', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const createOrder = (orderData) => api.post('/orders', orderData);
export const updateOrder = (id, orderData) => api.put(`/orders/${id}`, orderData);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const submitDoctorOrder = (orderData) => api.post('/orders', orderData);
export const submitStockistOrder = (orderData) => api.post('/orders', orderData);

// ============ MR TARGET ENDPOINTS ============
export const getMRTargets = (params) => api.get('/mr-targets', { params });
export const getMRTargetById = (id) => api.get(`/mr-targets/${id}`);
export const createMRTarget = (targetData) => api.post('/mr-targets', targetData);
export const updateMRTarget = (id, targetData) => api.put(`/mr-targets/${id}`, targetData);
export const deleteMRTarget = (id) => api.delete(`/mr-targets/${id}`);

// ============ MR PERFORMANCE ENDPOINTS ============
export const getMRPerformance = (params) => api.get('/mr-performance', { params });
export const getMRPerformanceById = (id) => api.get(`/mr-performance/${id}`);
export const createMRPerformance = (performanceData) => api.post('/mr-performance', performanceData);
export const updateMRPerformance = (id, performanceData) => api.put(`/mr-performance/${id}`, performanceData);
export const deleteMRPerformance = (id) => api.delete(`/mr-performance/${id}`);
export const fetchMRPerformance = () => api.get('/mr-performance');

// ============ PRODUCT ACTIVITY ENDPOINTS ============
export const getProductActivity = (params) => api.get('/product-activity', { params });
export const getProductActivityById = (id) => api.get(`/product-activity/${id}`);

// ============ STOCKIST ENDPOINTS ============
// Note: Stockists can be managed similar to doctors or as a separate entity
// For now, returning mock data - you can create a backend endpoint later
export const getStockists = () => {
  // Mock stockist data - replace with actual API call when backend endpoint is ready
  return Promise.resolve({
    data: {
      data: [
        { _id: '1', name: 'Main Stockist', location: 'Mumbai', contact: '+91-9876543210' },
        { _id: '2', name: 'Regional Stockist', location: 'Delhi', contact: '+91-9876543211' },
        { _id: '3', name: 'Local Distributor', location: 'Bangalore', contact: '+91-9876543212' }
      ]
    }
  });
};

// ============ LEGACY/ALIAS ENDPOINTS ============
export const getMRs = () => api.get('/users?role=MR');
export const addMR = (mrData) => api.post('/users', { ...mrData, role: 'MR' });
export const updateMR = (id, mrData) => api.put(`/users/${id}`, mrData);
export const deleteMR = (id) => api.delete(`/users/${id}`);
export const fetchAdminDashboard = () => api.get('/users/stats');
export const fetchAdminReports = (filters) => api.get('/visit-reports', { params: filters });

export default api;