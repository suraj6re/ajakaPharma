import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  UserGroupIcon, 
  UserCircleIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { getVisitReports } from '../services/api';
import { useAuth } from '../services/AuthContext';
import toast from 'react-hot-toast';

function exportVisitsToCSV(visits, filename) {
  if (!visits || visits.length === 0) {
    toast.error('No visits to export');
    return;
  }
  
  const headers = [
    'Visit Date',
    'Doctor Name',
    'Doctor Specialty',
    'Products Discussed',
    'Notes',
    'Status',
    'Orders'
  ];
  
  const csvRows = [headers.join(',')];
  
  visits.forEach(visit => {
    const visitDate = new Date(visit.visitDetails?.visitDate || visit.visitDate).toLocaleDateString();
    const doctorName = visit.doctor?.name || 'N/A';
    const doctorSpecialty = visit.doctor?.specialty || visit.doctor?.specialization || 'N/A';
    const products = visit.interaction?.productsDiscussed?.map(p => p.product?.basicInfo?.name || p.product?.name || 'Unknown').join('; ') || 
                     visit.productsDiscussed?.map(p => p.name || 'Unknown').join('; ') || 'N/A';
    const notes = (visit.interaction?.notes || visit.notes || '').replace(/"/g, '""');
    const status = visit.status || 'N/A';
    const orders = visit.orders?.map(o => `${o.product?.basicInfo?.name || o.product?.name || 'Unknown'} x${o.quantity}`).join('; ') || 'None';
    
    csvRows.push([
      `"${visitDate}"`,
      `"${doctorName}"`,
      `"${doctorSpecialty}"`,
      `"${products}"`,
      `"${notes}"`,
      `"${status}"`,
      `"${orders}"`
    ].join(','));
  });
  
  const csvData = csvRows.join('\n');
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Downloaded ${visits.length} visits`);
}

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const [showDownload, setShowDownload] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [downloading, setDownloading] = useState(false);

  const menuItems = [
    { path: '/mr-dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/report-visit', label: 'Report Visit', icon: ClipboardDocumentListIcon },
    { path: '/my-doctors', label: 'My Doctors', icon: UserGroupIcon },
    { path: '/profile', label: 'Profile', icon: UserCircleIcon }
  ];

  const isActive = (path) => location.pathname === path;

  const handleDownload = async () => {
    if (!dateFrom || !dateTo) {
      toast.error('Please select both dates');
      return;
    }
    
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    
    if (from > to) {
      toast.error('Start date must be before end date');
      return;
    }
    
    try {
      setDownloading(true);
      const response = await getVisitReports({ 
        mr: user._id || user.id,
        startDate: dateFrom,
        endDate: dateTo
      });
      
      const visits = response.data?.data?.visits || 
                     response.data?.visits || 
                     response.data?.data || 
                     response.data || 
                     [];
      
      if (!Array.isArray(visits) || visits.length === 0) {
        toast.error('No visits found in this date range');
        return;
      }
      
      exportVisitsToCSV(visits, `visits_${dateFrom}_to_${dateTo}.csv`);
      setShowDownload(false);
      setDateFrom('');
      setDateTo('');
    } catch (error) {
      console.error('Error downloading visits:', error);
      toast.error(error.response?.data?.message || 'Failed to download visits');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 ${
                  isActive(item.path) ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600' : ''
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
          
          {/* Download Recent Visits */}
          <li>
            <button
              className={`flex items-center w-full px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 ${
                showDownload ? 'bg-primary-100 text-primary-700' : ''
              }`}
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setShowDownload(!showDownload);
              }}
              title={isCollapsed ? 'Download Recent Visits' : ''}
            >
              <ArrowDownTrayIcon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && <span className="font-medium">Download Visits</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Download Recent Visits UI */}
      {!isCollapsed && showDownload && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Download Visit Reports</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={dateFrom} 
                  onChange={e => setDateFrom(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={dateTo} 
                  onChange={e => setDateTo(e.target.value)} 
                />
              </div>
              <button 
                className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Download CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200">
            <h4 className="text-sm font-medium text-primary-800 mb-2">Quick Info</h4>
            <p className="text-xs text-primary-700">Role: {user?.role || 'MR'}</p>
            <p className="text-xs text-primary-700">Territory: {user?.territory || 'Not assigned'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
