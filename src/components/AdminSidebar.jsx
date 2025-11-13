// src/components/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import images from '../utils/images';

const AdminSidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin-dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin-reports', label: 'Reports', icon: '📄' },
    { path: '/admin-doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { path: '/admin-products', label: 'Products', icon: '💊' },
    { path: '/admin-mrs', label: 'Manage MRs', icon: '👥' },
    { path: '/admin/mr-requests', label: 'MR Requests', icon: '📋' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/');
  };

  return (
    <div className={`bg-primary-800 text-white fixed left-0 top-0 h-full z-40 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center justify-center h-20 border-b border-primary-700">
        {isOpen ? (
          <div className="flex items-center space-x-3">
            <img 
              src={images.logo} 
              alt="Ajaka Pharma Logo" 
              className="h-8 w-auto object-contain"
            />
            <div>
              <div className="text-lg font-bold">Admin Panel</div>
              <div className="text-xs text-primary-200">Ajaka Pharma</div>
            </div>
          </div>
        ) : (
          <img 
            src={images.logo} 
            alt="Ajaka Pharma Logo" 
            className="h-8 w-auto object-contain"
          />
        )}
      </div>
      <nav className="mt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center py-3 px-4 my-1 transition-colors duration-200 ${
                  isActive(item.path) ? 'bg-primary-600' : 'hover:bg-primary-700'
                } ${!isOpen && 'justify-center'}`}
                title={!isOpen ? item.label : ''}
              >
                <span className="text-xl">{item.icon}</span>
                {isOpen && <span className="ml-4 font-medium">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-4 w-full px-4">
        <button
          onClick={handleLogout}
          className={`flex items-center py-3 px-4 w-full text-left transition-colors duration-200 hover:bg-red-600 rounded-lg ${!isOpen && 'justify-center'}`}
          title={!isOpen ? 'Logout' : ''}
        >
          <span className="text-xl">🚪</span>
          {isOpen && <span className="ml-4 font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
