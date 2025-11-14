import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  UserGroupIcon, 
  BeakerIcon, 
  ClipboardDocumentListIcon, 
  ShoppingCartIcon 
} from '@heroicons/react/24/outline';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { getVisitReports, getOrders, getAllDoctors, getProducts, getUsers } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalProducts: 0,
    totalVisits: 0,
    totalOrders: 0,
    totalMRs: 0
  });
  const [chartData, setChartData] = useState([]);
  const [mrPerformanceData, setMrPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [visitsRes, ordersRes, doctorsRes, productsRes, usersRes] = await Promise.all([
        getVisitReports().catch(() => ({ data: { data: { visits: [] } } })),
        getOrders().catch(() => ({ data: { data: [] } })),
        getAllDoctors().catch(() => ({ data: { data: { doctors: [] } } })),
        getProducts().catch(() => ({ data: { data: [] } })),
        getUsers({ role: 'MR' }).catch(() => ({ data: { data: { users: [] } } }))
      ]);

      const visits = visitsRes.data?.data?.visits || visitsRes.data?.data || visitsRes.data || [];
      const orders = ordersRes.data?.data || ordersRes.data || [];
      const doctors = doctorsRes.data?.data?.doctors || doctorsRes.data?.data || doctorsRes.data || [];
      const products = productsRes.data?.data || productsRes.data || [];
      const mrs = usersRes.data?.data?.users || usersRes.data?.data || usersRes.data || [];

      setStats({
        totalDoctors: Array.isArray(doctors) ? doctors.length : 0,
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalVisits: Array.isArray(visits) ? visits.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalMRs: Array.isArray(mrs) ? mrs.length : 0
      });

      // Product orders chart
      if (Array.isArray(visits)) {
        const productCounts = {};
        visits.forEach(visit => {
          const productsDiscussed = visit.interaction?.productsDiscussed || visit.productsDiscussed || [];
          productsDiscussed.forEach(item => {
            const productName = item.product?.basicInfo?.name || item.product?.name || item.name || 'Unknown';
            productCounts[productName] = (productCounts[productName] || 0) + 1;
          });
        });

        const chartDataArray = Object.entries(productCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setChartData(chartDataArray);
      }

      // MR Performance data
      if (Array.isArray(mrs) && Array.isArray(visits)) {
        const mrPerformance = mrs.map(mr => {
          const mrVisits = visits.filter(v => 
            (v.mr?._id || v.mr) === (mr._id || mr.id)
          );
          const mrOrders = mrVisits.reduce((sum, v) => 
            sum + (v.orders?.length || 0), 0
          );
          
          return {
            id: mr._id || mr.id,
            name: mr.name || mr.email,
            visits: mrVisits.length,
            orders: mrOrders,
            performance: mrVisits.length > 0 ? Math.min(100, Math.round((mrOrders / mrVisits.length) * 50 + 50)) : 0
          };
        }).filter(mr => mr.visits > 0);

        setMrPerformanceData(mrPerformance);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
        </div>
        <div className={`p-4 rounded-lg bg-gray-50`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <AdminSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your pharmaceutical operations</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard title="Total Doctors" value={stats.totalDoctors} icon={UserGroupIcon} color="text-blue-600" />
                <StatCard title="Total Products" value={stats.totalProducts} icon={BeakerIcon} color="text-green-600" />
                <StatCard title="Total Visits" value={stats.totalVisits} icon={ClipboardDocumentListIcon} color="text-purple-600" />
                <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCartIcon} color="text-pink-600" />
                <StatCard title="Total MRs" value={stats.totalMRs} icon={UserGroupIcon} color="text-orange-600" />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Product Discussion Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Discussed Products</h2>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Discussions" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-80 text-gray-400">
                      No product data available
                    </div>
                  )}
                </motion.div>

                {/* MR Performance Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">MR Performance Overview</h2>
                  {mrPerformanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={mrPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="visits" fill="#82ca9d" name="Visits" />
                        <Bar dataKey="orders" fill="#ffc658" name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-80 text-gray-400">
                      No MR performance data available
                    </div>
                  )}
                </motion.div>
              </div>

              {/* MR Performance Table */}
              {mrPerformanceData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">MR Performance Details</h2>
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
                          <tr key={mr.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mr.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mr.visits}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mr.orders}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      mr.performance >= 80 ? 'bg-green-500' :
                                      mr.performance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${mr.performance}%` }}
                                  ></div>
                                </div>
                                <span>{mr.performance}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                mr.performance >= 80 ? 'bg-green-100 text-green-800' :
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
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
