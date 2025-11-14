import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FunnelIcon, 
  ArrowDownTrayIcon, 
  MagnifyingGlassIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { getVisitReports } from '../services/api';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({ search: '', mrId: '', from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [filters.from, filters.to]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.from) params.startDate = filters.from;
      if (filters.to) params.endDate = filters.to;
      
      const response = await getVisitReports(params);
      const data = response.data?.data?.visits || response.data?.data || response.data || [];
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch reports", error);
      toast.error(error.response?.data?.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...reports];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(r => 
        r.doctor?.name?.toLowerCase().includes(search) ||
        r.mr?.name?.toLowerCase().includes(search) ||
        r.mr?.email?.toLowerCase().includes(search)
      );
    }
    
    if (filters.mrId) {
      data = data.filter(r => (r.mr?._id || r.mr) === filters.mrId);
    }
    
    setFilteredReports(data);
  }, [filters.search, filters.mrId, reports]);

  const uniqueMRs = useMemo(() => {
    const mrMap = new Map();
    reports.forEach(r => {
      if (r.mr?._id) {
        mrMap.set(r.mr._id, r.mr);
      }
    });
    return Array.from(mrMap.values());
  }, [reports]);

  const exportToCSV = () => {
    if (filteredReports.length === 0) {
      toast.error('No reports to export');
      return;
    }

    const headers = ['Visit Date', 'Doctor Name', 'Doctor Specialty', 'MR Name', 'MR Email', 'Products Discussed', 'Notes', 'Status'];
    const csvRows = [headers.join(',')];
    
    filteredReports.forEach(report => {
      const visitDate = new Date(report.visitDetails?.visitDate || report.visitDate).toLocaleDateString();
      const doctorName = report.doctor?.name || 'N/A';
      const doctorSpecialty = report.doctor?.specialty || report.doctor?.specialization || 'N/A';
      const mrName = report.mr?.name || 'N/A';
      const mrEmail = report.mr?.email || 'N/A';
      const products = (report.interaction?.productsDiscussed || report.productsDiscussed || [])
        .map(p => p.product?.basicInfo?.name || p.product?.name || p.name || 'Unknown')
        .join('; ');
      const notes = (report.interaction?.notes || report.notes || '').replace(/"/g, '""');
      const status = report.status || 'N/A';
      
      csvRows.push([
        `"${visitDate}"`,
        `"${doctorName}"`,
        `"${doctorSpecialty}"`,
        `"${mrName}"`,
        `"${mrEmail}"`,
        `"${products}"`,
        `"${notes}"`,
        `"${status}"`
      ].join(','));
    });
    
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visit-reports-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredReports.length} reports`);
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
                  <DocumentChartBarIcon className="w-8 h-8 mr-3 text-primary-600" />
                  Visit Reports
                </h1>
                <p className="text-gray-600 mt-1">View and analyze all visit reports</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctor or MR..."
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
                Showing {filteredReports.length} of {reports.length} reports
              </p>
              <button
                onClick={() => setFilters({ search: '', mrId: '', from: '', to: '' })}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>

          {/* Reports Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MR</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map((report, index) => (
                      <tr key={report._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(report.visitDetails?.visitDate || report.visitDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{report.doctor?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{report.doctor?.specialty || report.doctor?.specialization || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.mr?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{report.mr?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {(report.interaction?.productsDiscussed || report.productsDiscussed || [])
                              .map(p => p.product?.basicInfo?.name || p.product?.name || p.name || 'Unknown')
                              .join(', ') || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            report.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            report.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500 max-w-xs truncate">
                            {report.interaction?.notes || report.notes || 'No notes'}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentChartBarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No reports found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
