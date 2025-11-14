import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../services/AuthContext';

const MRDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { getVisitReports } = await import('../services/api');
        const response = await getVisitReports({ mr: user._id || user.id });
        
        // Handle different response structures
        const reportsData = response.data?.data?.visitReports || 
                           response.data?.data || 
                           response.data?.visitReports || 
                           response.data || 
                           [];
        
        setReports(Array.isArray(reportsData) ? reportsData : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load reports');
        setReports([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const stats = useMemo(() => {
    // Safety check - ensure reports is an array
    if (!Array.isArray(reports)) {
      return {
        visitsToday: 0,
        visitsThisWeek: 0,
        visitsThisMonth: 0,
        totalDoctors: 0,
        pendingOrders: 0
      };
    }

    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const visitsToday = reports.filter(report => {
      const visitDate = new Date(report.visitDate);
      return visitDate.toDateString() === today.toDateString();
    }).length;

    const visitsThisWeek = reports.filter(report => {
      const visitDate = new Date(report.visitDate);
      return visitDate >= thisWeek;
    }).length;

    const visitsThisMonth = reports.filter(report => {
      const visitDate = new Date(report.visitDate);
      return visitDate >= thisMonth;
    }).length;

    const totalOrders = reports.reduce((sum, report) => sum + (report.orders?.length || 0), 0);
    const uniqueDoctors = new Set(reports.map(r => r.doctor.name)).size;
    const uniqueProducts = new Set(reports.flatMap(r => r.productsDiscussed.map(p => p.name))).size;

    return {
      totalVisits: reports.length,
      visitsToday,
      visitsThisWeek,
      visitsThisMonth,
      totalOrders,
      uniqueDoctors,
      uniqueProducts,
      completionRate: reports.length > 0 ? Math.round((reports.filter(r => r.status === 'Completed').length / reports.length) * 100) : 0
    };
  }, [reports]);

  const quickActions = [
    {
      title: 'Report New Visit',
      description: 'Log your latest doctor visit',
      icon: ClipboardDocumentListIcon,
      href: '/report-visit',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'My Doctors',
      description: 'Manage doctor database',
      icon: UserGroupIcon,
      href: '/my-doctors',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'My Profile',
      description: 'View and edit profile',
      icon: UserCircleIcon,
      href: '/profile',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color = 'text-primary-600' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gray-50`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      <main className="ml-64 pt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.name || user?.personalInfo?.name || user?.email || 'MR'}! 👋
                </h1>
                <p className="text-gray-600 mt-1">Here's your performance overview for today.</p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="form-input text-sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <Link
                  to="/report-visit"
                  className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Visit
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Visits"
              value={stats.totalVisits}
              icon={CalendarDaysIcon}
              trend={`${stats.visitsThisMonth} this month`}
            />
            <StatCard
              title="Today's Visits"
              value={stats.visitsToday}
              icon={MapPinIcon}
              trend={`${stats.visitsThisWeek} this week`}
              color="text-green-600"
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={TruckIcon}
              trend="Across all visits"
              color="text-blue-600"
            />
            <StatCard
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              icon={CheckCircleIcon}
              trend="Visit success rate"
              color="text-purple-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={action.href}
                    className={`block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${action.color} ${action.hoverColor} transition-colors duration-200`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                <Link to="/reports" className="text-sm text-primary-600 hover:text-primary-700">
                  View All
                </Link>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8 text-red-500">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                  {error}
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {reports.length > 0 ? (
                    reports.slice(0, 5).map((report, index) => (
                      <motion.div
                        key={report._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{report.doctor.name}</h4>
                            <p className="text-sm text-gray-600">{report.doctor.specialty}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {report.productsDiscussed.map(p => p.name).join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(report.visitDate).toLocaleDateString()}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              report.status === 'Completed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.status === 'Completed' ? (
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                              ) : (
                                <ClockIcon className="w-3 h-3 mr-1" />
                              )}
                              {report.status}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No reports submitted yet.</p>
                      <Link to="/report-visit" className="text-primary-600 hover:text-primary-700 text-sm">
                        Create your first report
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Doctors Visited</span>
                  <span className="font-semibold text-gray-900">{stats.uniqueDoctors}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Products Promoted</span>
                  <span className="font-semibold text-gray-900">{stats.uniqueProducts}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Orders Generated</span>
                  <span className="font-semibold text-gray-900">{stats.totalOrders}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Monthly Target</span>
                    <span className="text-sm text-gray-900">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MRDashboard;