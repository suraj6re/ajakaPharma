import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function exportVisitsToCSV(visits, filename) {
  if (!visits || visits.length === 0) return;
  const headers = [
    'Visit ID',
    'MR Name',
    'Doctor/Hospital Visited',
    'Date of Visit',
    'Notes/Comments',
    'Medicine Brand Promoted'
  ];
  const csvRows = [headers.join(',')];
  visits.forEach(v => {
    csvRows.push([
      v.id,
      JSON.stringify(v.mrName || ''),
      JSON.stringify(v.doctorName || ''),
      JSON.stringify(v.date || ''),
      JSON.stringify(v.notes || ''),
      JSON.stringify((v.promotedBrands && v.promotedBrands.length > 0) ? v.promotedBrands.join('; ') : '')
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
}

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const [showDownload, setShowDownload] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [downloadError, setDownloadError] = useState('');

  const menuItems = [
    { path: '/mr-dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/report-visit', label: 'Report Visit', icon: '📝' },
    { path: '/stockist-order', label: 'Stockist Order', icon: '🛒' },
    { path: '/my-doctors', label: 'My Doctors', icon: '👨‍⚕️' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleDownload = () => {
    setDownloadError('');
    if (!dateFrom || !dateTo) {
      setDownloadError('Please select both dates.');
      return;
    }
    // Mock data for now - in real app, fetch from API
    const visits = [];
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const filtered = visits.filter(v => {
      if (!v.date) return false;
      const d = new Date(v.date);
      return d >= from && d <= to;
    });
    if (filtered.length === 0) {
      setDownloadError('No visits found in this date range.');
      return;
    }
    exportVisitsToCSV(filtered, 'recent-visits.csv');
  };

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          {isCollapsed ? '▶️' : '◀️'}
        </button>
      </div>

      <nav className="px-0 pb-4"> {/* Remove px-4 for left alignment */}
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-link flex items-center pl-4 pr-2 py-2 ${isActive(item.path) ? 'active' : ''}`}
                title={isCollapsed ? item.label : ''}
                style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
              >
                <span className="text-lg mr-3 flex items-center justify-center w-6 h-6">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
          {/* Download Recent Visits menu item */}
          <li>
            <button
              className={`sidebar-link flex items-center w-full text-left pl-4 pr-2 py-2 ${showDownload ? 'active' : ''}`}
              style={{ outline: 'none', background: 'none', border: 'none', padding: 0, justifyContent: isCollapsed ? 'center' : 'flex-start' }}
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setShowDownload(true);
              }}
              title={isCollapsed ? 'Download Recent Visits' : ''}
            >
              <span className="text-lg mr-3 flex items-center justify-center w-6 h-6">⬇️</span>
              {!isCollapsed && <span className="font-medium">Download Recent Visits</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Download Recent Visits UI */}
      {!isCollapsed && showDownload && (
        <div className="px-4 pb-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-2">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Download Recent Visits</h4>
            <div className="flex flex-col space-y-2">
              <label className="text-xs text-gray-600">From:
                <input type="date" className="form-input mt-1" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </label>
              <label className="text-xs text-gray-600">To:
                <input type="date" className="form-input mt-1" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </label>
              <button className="btn-primary mt-2" onClick={handleDownload}>Download CSV</button>
              {downloadError && <p className="text-xs text-red-600 mt-1">{downloadError}</p>}
            </div>
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200">
            <h4 className="text-sm font-medium text-primary-800 mb-1">Quick Stats</h4>
            <p className="text-xs text-primary-700">Today's visits: 3</p>
            <p className="text-xs text-primary-700">Pending orders: 2</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
