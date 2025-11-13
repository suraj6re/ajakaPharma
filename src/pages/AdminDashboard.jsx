// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import AdminSidebar from '../components/AdminSidebar';
import AdminCard from '../components/AdminCard';
import AdminNavbar from '../components/AdminNavbar';
import { fetchAdminDashboard, fetchMRPerformance } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalProducts: 0,
    totalVisits: 0,
    totalOrders: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [mrPerformanceData, setMrPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all necessary data
        const { getVisitReports, getOrders, getAllDoctors, getProducts, getMRPerformance } = await import('../services/api');
        
        const [visitsRes, ordersRes, doctorsRes, productsRes, performanceRes] = await Promise.all([
          getVisitReports(),
          getOrders(),
          getAllDoctors(),
          getProducts(),
          getMRPerformance()
        ]);

        const visits = visitsRes.data.data || [];
        const orders = ordersRes.data.data || [];
        const doctors = doctorsRes.data.data || [];
        const products = productsRes.data.data || [];
        const performance = performanceRes.data.data || [];

        // Calculate stats
        setStats({
          totalDoctors: doctors.length,
          totalProducts: products.length,
          totalVisits: visits.length,
          totalOrders: orders.length,
        });

        // Prepare chart data - orders per product
        const productOrderCounts = {};
        orders.forEach(order => {
          order.items?.forEach(item => {
            const productName = item.product?.product_name || item.product?.name || 'Unknown';
            productOrderCounts[productName] = (productOrderCounts[productName] || 0) + (item.quantity || 0);
          });
        });

        const chartDataArray = Object.entries(productOrderCounts)
          .map(([name, orders]) => ({ name, orders }))
          .sort((a, b) => b.orders - a.orders)
          .slice(0, 10);

        setChartData(chartDataArray);

        // Prepare MR performance data
        const mrPerformanceArray = performance.map(p => ({
          id: p._id,
          name: p.mr?.name || p.mr?.email || 'Unknown MR',
          visits: p.totalVisits || 0,
          orders: p.totalOrders || 0,
          performance: Math.round(p.performanceScore || 0)
        }));

        setMrPerformanceData(mrPerformanceArray);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <AdminSidebar isOpen={isSidebarOpen} />
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-16'}`}>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AdminCard title="Total Doctors" value={stats.totalDoctors} icon="👨‍⚕️" />
                <AdminCard title="Total Products" value={stats.totalProducts} icon="💊" />
                <AdminCard title="Total Visits" value={stats.totalVisits} icon="🏥" />
                <AdminCard title="Total Orders" value={stats.totalOrders} icon="📦" />
              </div>
              {/* Main Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Orders per Product</h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">MR Performance Overview</h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={mrPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="visits" fill="#82ca9d" name="Visits" />
                      <Bar dataKey="orders" fill="#ffc658" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Secondary Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">MR Performance Score</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mrPerformanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, performance }) => `${name}: ${performance}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="performance"
                      >
                        {mrPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Top Products Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, orders }) => `${name}: ${orders}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="orders"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">MR Sales Trend</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mrPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="performance" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* MR Performance Table */}
              <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">MR Performance Details</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MR Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visits</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mrPerformanceData.map((mr) => (
                        <tr key={mr.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mr.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mr.visits}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mr.orders}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${mr.performance}%` }}
                                ></div>
                              </div>
                              <span>{mr.performance}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${mr.performance >= 80 ? 'bg-green-100 text-green-800' :
                              mr.performance >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {mr.performance >= 80 ? 'Excellent' :
                                mr.performance >= 60 ? 'Good' : 'Needs Improvement'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
