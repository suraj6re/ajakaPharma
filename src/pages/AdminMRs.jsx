import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import { getMRs, addMR, updateMR, deleteMR, fetchMRPerformance } from '../services/api';
import ExportButton from '../components/ExportButton';

const AdminMRs = () => {
  const [mrs, setMrs] = useState([]);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [mrPerformance, setMrPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMr, setEditingMr] = useState(null);
  const [newMr, setNewMr] = useState({ name: '', email: '', region: '', phone: '', city: '', hq: '' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mrsResponse, performanceResponse] = await Promise.all([
          getMRs(),
          fetchMRPerformance()
        ]);
        setMrs(mrsResponse.data.data || []);
        
        const performanceData = performanceResponse.data.data || [];
        const formattedPerformance = performanceData.map(p => ({
          id: p.mr?._id || p.mr,
          visits: p.totalVisits || 0,
          orders: p.totalOrders || 0,
          performance: Math.round(p.performanceScore || 0)
        }));
        setMrPerformance(formattedPerformance);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch MRs data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddMr = async (e) => {
    e.preventDefault();
    try {
      let saved;
      if (editingMr) {
        const response = await updateMR(editingMr._id, newMr);
        saved = response.data.data;
        setMrs(mrs.map(m => (m._id === saved._id ? saved : m)));
      } else {
        const response = await addMR(newMr);
        saved = response.data.data;
        setMrs([...mrs, saved]);
      }
      setNewMr({ name: '', email: '', region: '', phone: '', city: '', hq: '' });
      setShowAddForm(false);
      setEditingMr(null);
      setSuccess(editingMr ? 'MR updated successfully!' : 'MR added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding MR:', error);
      setError(error.response?.data?.message || 'Failed to save MR. Please try again.');
    }
  };

  const handleEditMr = (mr) => {
    setEditingMr(mr);
    setNewMr({ ...mr });
    setShowAddForm(true);
  };

  const handleDeleteMr = async (mrId) => {
    if (window.confirm('Are you sure you want to delete this MR?')) {
      try {
        await deleteMR(mrId);
        setMrs(mrs.filter(mr => mr._id !== mrId));
        setSuccess('MR deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting MR:', error);
        setError('Failed to delete MR. Please try again.');
      }
    }
  };

  const getMrPerformance = (mrId) => {
    return mrPerformance.find(p => p.id === mrId) || { visits: 0, orders: 0, performance: 0 };
  };

  const resetForm = () => {
    setNewMr({ name: '', email: '', region: '', phone: '', city: '', hq: '' });
    setEditingMr(null);
    setShowAddForm(false);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <AdminSidebar isOpen={isSidebarOpen} />
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-16'} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage MRs</h1>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            {showAddForm ? 'Cancel' : 'Add MR'}
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {editingMr ? 'Edit MR' : 'Add New MR'}
            </h2>
            <form onSubmit={handleAddMr}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newMr.name}
                  onChange={(e) => setNewMr({ ...newMr, name: e.target.value })}
                  className="form-input"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newMr.email}
                  onChange={(e) => setNewMr({ ...newMr, email: e.target.value })}
                  className="form-input"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newMr.phone}
                  onChange={(e) => setNewMr({ ...newMr, phone: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Region/Territory"
                  value={newMr.region}
                  onChange={(e) => setNewMr({ ...newMr, region: e.target.value })}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newMr.city}
                  onChange={(e) => setNewMr({ ...newMr, city: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Headquarters"
                  value={newMr.hq}
                  onChange={(e) => setNewMr({ ...newMr, hq: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="flex space-x-4 mt-4">
                <button type="submit" className="btn-primary">
                  {editingMr ? 'Update MR' : 'Add MR'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && <p>Loading MRs...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input className="form-input" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
              <input className="form-input" placeholder="Filter by region" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} />
              <input className="form-input" placeholder="Filter by city" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} />
            </div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">MR List ({mrs.length})</h2>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">Total Active MRs: {mrs.length}</div>
                <ExportButton
                  filename="mrs.csv"
                  data={mrs
                    .filter(m =>
                      (!search || `${m.name} ${m.email}`.toLowerCase().includes(search.toLowerCase())) &&
                      (!regionFilter || (m.region || '').toLowerCase().includes(regionFilter.toLowerCase())) &&
                      (!cityFilter || (m.city || '').toLowerCase().includes(cityFilter.toLowerCase()))
                    )
                    .map(m => ({
                      name: m.name,
                      email: m.email,
                      employeeId: m.employeeId,
                      region: m.region || '',
                      city: m.city || '',
                      phone: m.phone || '',
                      hq: m.hq || ''
                    }))}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MR Details</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mrs.filter(m =>
                    (!search || `${m.name} ${m.email}`.toLowerCase().includes(search.toLowerCase())) &&
                    (!regionFilter || (m.region || '').toLowerCase().includes(regionFilter.toLowerCase())) &&
                    (!cityFilter || (m.city || '').toLowerCase().includes(cityFilter.toLowerCase()))
                  ).map((mr) => {
                    const performance = getMrPerformance(mr._id);
                    return (
                      <tr key={mr._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{mr.name}</div>
                            <div className="text-sm text-gray-500">{mr.region}</div>
                            {mr.city && <div className="text-xs text-gray-400">{mr.city}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{mr.email}</div>
                            {mr.phone && <div className="text-sm text-gray-500">{mr.phone}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm">
                              <div className="text-gray-900">Visits: {performance.visits}</div>
                              <div className="text-gray-500">Orders: {performance.orders}</div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    performance.performance >= 80 ? 'bg-green-500' :
                                    performance.performance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${performance.performance}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{performance.performance}%</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditMr(mr)}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md text-xs transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMr(mr._id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs transition-colors"
                            >
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
            
            {mrs.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">👥</div>
                <p className="text-gray-500">No MRs found. Add your first MR to get started.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminMRs;
