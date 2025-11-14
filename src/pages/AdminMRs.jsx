import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import { getUsers, createUser, updateUser, deleteUser, getVisitReports } from '../services/api';
import toast from 'react-hot-toast';

const AdminMRs = () => {
  const [mrs, setMrs] = useState([]);
  const [filteredMRs, setFilteredMRs] = useState([]);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [mrPerformance, setMrPerformance] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMr, setEditingMr] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newMr, setNewMr] = useState({ 
    name: '', 
    email: '', 
    password: '',
    territory: '', 
    phone: '', 
    city: '', 
    region: '',
    employeeId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...mrs];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(mr =>
        mr.name?.toLowerCase().includes(searchLower) ||
        mr.email?.toLowerCase().includes(searchLower) ||
        mr.employeeId?.toLowerCase().includes(searchLower)
      );
    }
    
    if (regionFilter) {
      filtered = filtered.filter(mr =>
        (mr.region || mr.territory)?.toLowerCase().includes(regionFilter.toLowerCase())
      );
    }
    
    setFilteredMRs(filtered);
  }, [search, regionFilter, mrs]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mrsResponse, visitsResponse] = await Promise.all([
        getUsers({ role: 'MR' }),
        getVisitReports().catch(() => ({ data: { data: { visits: [] } } }))
      ]);
      
      const mrsData = mrsResponse.data?.data?.users || mrsResponse.data?.data || mrsResponse.data || [];
      setMrs(Array.isArray(mrsData) ? mrsData : []);
      
      const visits = visitsResponse.data?.data?.visits || visitsResponse.data?.data || visitsResponse.data || [];
      
      // Calculate performance for each MR
      const performance = {};
      if (Array.isArray(visits) && Array.isArray(mrsData)) {
        mrsData.forEach(mr => {
          const mrVisits = visits.filter(v => (v.mr?._id || v.mr) === (mr._id || mr.id));
          const mrOrders = mrVisits.reduce((sum, v) => sum + (v.orders?.length || 0), 0);
          performance[mr._id] = {
            visits: mrVisits.length,
            orders: mrOrders,
            performance: mrVisits.length > 0 ? Math.min(100, Math.round((mrOrders / mrVisits.length) * 50 + 50)) : 0
          };
        });
      }
      setMrPerformance(performance);
    } catch (err) {
      console.error('Error fetching MRs:', err);
      toast.error('Failed to load MRs data');
      setMrs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMr = async (e) => {
    e.preventDefault();
    
    if (!newMr.name || !newMr.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      const mrData = {
        ...newMr,
        role: 'MR'
      };

      if (editingMr) {
        // Remove password if empty during edit
        if (!mrData.password) delete mrData.password;
        const response = await updateUser(editingMr._id, mrData);
        const saved = response.data?.data || response.data;
        setMrs(mrs.map(m => (m._id === saved._id ? saved : m)));
        toast.success('MR updated successfully!');
      } else {
        if (!mrData.password) {
          toast.error('Password is required for new MR');
          return;
        }
        const response = await createUser(mrData);
        const saved = response.data?.data || response.data;
        setMrs([...mrs, saved]);
        toast.success('MR added successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving MR:', error);
      toast.error(error.response?.data?.message || 'Failed to save MR');
    }
  };

  const handleEditMr = (mr) => {
    setEditingMr(mr);
    setNewMr({ 
      name: mr.name || '',
      email: mr.email || '',
      password: '', // Don't populate password
      territory: mr.territory || mr.region || '',
      phone: mr.phone || '',
      city: mr.city || '',
      region: mr.region || mr.territory || '',
      employeeId: mr.employeeId || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteMr = async (mrId) => {
    if (!window.confirm('Are you sure you want to delete this MR?')) return;
    
    try {
      await deleteUser(mrId);
      setMrs(mrs.filter(mr => mr._id !== mrId));
      toast.success('MR deleted successfully!');
    } catch (error) {
      console.error('Error deleting MR:', error);
      toast.error('Failed to delete MR');
    }
  };

  const resetForm = () => {
    setNewMr({ name: '', email: '', password: '', territory: '', phone: '', city: '', region: '', employeeId: '' });
    setEditingMr(null);
    setShowAddForm(false);
  };

  const exportToCSV = () => {
    if (filteredMRs.length === 0) {
      toast.error('No MRs to export');
      return;
    }

    const headers = ['Name', 'Email', 'Employee ID', 'Territory', 'City', 'Phone', 'Visits', 'Orders', 'Performance'];
    const csvRows = [headers.join(',')];
    
    filteredMRs.forEach(mr => {
      const perf = mrPerformance[mr._id] || { visits: 0, orders: 0, performance: 0 };
      csvRows.push([
        `"${mr.name || ''}"`,
        `"${mr.email || ''}"`,
        `"${mr.employeeId || ''}"`,
        `"${mr.territory || mr.region || ''}"`,
        `"${mr.city || ''}"`,
        `"${mr.phone || ''}"`,
        perf.visits,
        perf.orders,
        `${perf.performance}%`
      ].join(','));
    });
    
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mrs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredMRs.length} MRs`);
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
                  <UsersIcon className="w-8 h-8 mr-3 text-primary-600" />
                  Manage MRs
                </h1>
                <p className="text-gray-600 mt-1">Add, edit, and manage medical representatives</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  Export CSV
                </button>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)} 
                  className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  {showAddForm ? 'Cancel' : 'Add MR'}
                </button>
              </div>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingMr ? 'Edit MR' : 'Add New MR'}
              </h2>
              <form onSubmit={handleAddMr}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      value={newMr.name}
                      onChange={(e) => setNewMr({ ...newMr, name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      value={newMr.email}
                      onChange={(e) => setNewMr({ ...newMr, email: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Password {!editingMr && '*'}</label>
                    <input
                      type="password"
                      value={newMr.password}
                      onChange={(e) => setNewMr({ ...newMr, password: e.target.value })}
                      className="form-input"
                      placeholder={editingMr ? 'Leave blank to keep current' : 'Enter password'}
                      required={!editingMr}
                    />
                  </div>
                  <div>
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      value={newMr.employeeId}
                      onChange={(e) => setNewMr({ ...newMr, employeeId: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={newMr.phone}
                      onChange={(e) => setNewMr({ ...newMr, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Territory/Region</label>
                    <input
                      type="text"
                      value={newMr.territory}
                      onChange={(e) => setNewMr({ ...newMr, territory: e.target.value, region: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={newMr.city}
                      onChange={(e) => setNewMr({ ...newMr, city: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button type="submit" className="btn-primary">
                    {editingMr ? 'Update MR' : 'Add MR'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or employee ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <input
                type="text"
                placeholder="Filter by territory/region..."
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {filteredMRs.length} of {mrs.length} MRs
              </p>
              <button
                onClick={() => { setSearch(''); setRegionFilter(''); }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>

          {/* MRs Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredMRs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MR Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Territory</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMRs.map((mr) => {
                      const perf = mrPerformance[mr._id] || { visits: 0, orders: 0, performance: 0 };
                      return (
                        <tr key={mr._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-700 font-semibold">{mr.name?.charAt(0) || 'M'}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{mr.name}</div>
                                <div className="text-sm text-gray-500">{mr.employeeId || 'No ID'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{mr.email}</div>
                            {mr.phone && <div className="text-sm text-gray-500">{mr.phone}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{mr.territory || mr.region || 'N/A'}</div>
                            {mr.city && <div className="text-sm text-gray-500">{mr.city}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="text-sm">
                                <div className="text-gray-900">Visits: {perf.visits}</div>
                                <div className="text-gray-500">Orders: {perf.orders}</div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      perf.performance >= 80 ? 'bg-green-500' :
                                      perf.performance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${perf.performance}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">{perf.performance}%</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditMr(mr)}
                                className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                              >
                                <PencilIcon className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMr(mr._id)}
                                className="inline-flex items-center text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                              >
                                <TrashIcon className="w-4 h-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UsersIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No MRs found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {search || regionFilter ? 'Try adjusting your filters' : 'Add your first MR to get started'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Stats */}
          {!loading && mrs.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Total MRs</p>
                <p className="text-2xl font-bold text-primary-600">{mrs.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Active Territories</p>
                <p className="text-2xl font-bold text-primary-600">
                  {new Set(mrs.map(m => m.territory || m.region).filter(Boolean)).size}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-primary-600">
                  {Object.values(mrPerformance).reduce((sum, p) => sum + p.visits, 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-primary-600">
                  {Object.values(mrPerformance).reduce((sum, p) => sum + p.orders, 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminMRs;
