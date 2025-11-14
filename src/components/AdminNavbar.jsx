import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../services/AuthContext';
import images from '../utils/images';

const AdminNavbar = ({ onToggleSidebar, isSidebarOpen = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className={`flex justify-between items-center h-20 px-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onToggleSidebar} 
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Toggle sidebar"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <img 
              src={images.logo} 
              alt="Ajaka Pharma Logo" 
              className="h-10 w-auto object-contain"
            />
            <div className="leading-tight">
              <div className="text-lg font-bold text-primary-600">AJAKA PHARMA</div>
              <div className="text-xs text-gray-500 font-medium -mt-1">Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">
              {user?.name || user?.email || 'Admin'}
            </div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
          <button 
            onClick={handleLogout} 
            className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
