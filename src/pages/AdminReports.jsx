import React, { useState, useEffect, useMemo } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import ExportButton from '../components/ExportButton';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({ doctorId: '', mrId: '', from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const getReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { getVisitReports } = await import('../services/api');
        const params = {};
        if (filters.mrId) params.mr = filters.mrId;
        if (filters.doctorId) params.doctor = filters.doctorId;
        if (filters.from) params.startDate = filters.from;
        if (filters.to) params.endDate = filters.to;
        
        const response = await getVisitReports(params);
        const data = response.data.data || [];
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        console.error("Failed to fetch reports", error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
    getReports();
  }, [filters.from, filters.to, filters.mrId, filters.doctorId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    let data = [...reports];
    if (filters.doctorId) data = data.filter(r => r.doctor._id === filters.doctorId);
    if (filters.mrId) data = data.filter(r => r.mr._id === filters.mrId);
    setFilteredReports(data);
  }, [filters.doctorId, filters.mrId, reports]);

  const uniqueDoctors = useMemo(() => {
    return [...new Map(reports.map(item => [item.doctor._id, item.doctor])).values()];
  }, [reports]);

  const uniqueMRs = useMemo(() => {
    return [...new Map(reports.map(item => [item.mr._id, item.mr])).values()];
  }, [reports]);

  const csvData = useMemo(() => 
    filteredReports.map(report => ({
      visitDate: new Date(report.visitDate).toLocaleDateString(),
      doctorName: report.doctor.name,
      doctorSpecialty: report.doctor.specialty,
      mrName: report.mr.name,
      mrEmployeeId: report.mr.employeeId,
      productsDiscussed: report.productsDiscussed.map(p => p.product_name || p.name).join(', '),
      notes: report.notes,
      orders: (report.orders && report.orders.length > 0)
        ? report.orders.map(o => `${(o.product && o.product.name) || o.product}: ${o.quantity}`).join('; ')
        : '',
    })),
  [filteredReports]);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <AdminSidebar isOpen={isSidebarOpen} />
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-16'}`}>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Reports</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select name="doctorId" value={filters.doctorId} onChange={handleFilterChange} className="form-input">
                <option value="">All Doctors</option>
                {uniqueDoctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <select name="mrId" value={filters.mrId} onChange={handleFilterChange} className="form-input">
                <option value="">All MRs</option>
                {uniqueMRs.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
              <input type="date" name="from" value={filters.from} onChange={handleFilterChange} className="form-input" />
              <input type="date" name="to" value={filters.to} onChange={handleFilterChange} className="form-input" />
              <button onClick={() => setFilters({ doctorId: '', mrId: '', from: '', to: '' })} className="btn-secondary">Clear</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Visit Data</h2>
              <ExportButton data={csvData} filename="visit-reports.csv" />
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">Loading reports...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">Error: {error}</div>
              ) : (
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-4 border-b text-left">Visit Date</th>
                      <th className="py-2 px-4 border-b text-left">Doctor</th>
                      <th className="py-2 px-4 border-b text-left">MR</th>
                      <th className="py-2 px-4 border-b text-left">Products Discussed</th>
                      <th className="py-2 px-4 border-b text-left">Notes</th>
                      <th className="py-2 px-4 border-b text-left">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length > 0 ? (
                      filteredReports.map(report => (
                        <tr key={report._id}>
                          <td className="py-2 px-4 border-b">{new Date(report.visitDate).toLocaleDateString()}</td>
                          <td className="py-2 px-4 border-b">
                            {report.doctor?.name || 'N/A'} 
                            {report.doctor?.specialty || report.doctor?.specialization ? ` (${report.doctor.specialty || report.doctor.specialization})` : ''}
                          </td>
                          <td className="py-2 px-4 border-b">{report.mr?.name || report.mr?.email || 'N/A'}</td>
                          <td className="py-2 px-4 border-b">
                            {report.productsDiscussed?.map(p => p.product_name || p.name || 'Unknown').join(', ') || 'N/A'}
                          </td>
                          <td className="py-2 px-4 border-b"><p className="truncate w-48">{report.notes || 'N/A'}</p></td>
                          <td className="py-2 px-4 border-b">
                            {report.orders && report.orders.length > 0 ? (
                              <ul className="list-disc pl-4">
                                {report.orders.map((order, idx) => (
                                  <li key={idx}>
                                    {order.product && (order.product.product_name || order.product.name) ? (order.product.product_name || order.product.name) : order.product} &times; {order.quantity}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-400">No orders</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="text-center py-4">No reports found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;