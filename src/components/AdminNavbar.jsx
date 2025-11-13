// src/components/AdminNavbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import images from '../utils/images';

const AdminNavbar = ({ onToggleSidebar, isSidebarOpen = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Use useAuth hook

  const handleLogout = async () => {
    await logout(); // Use the logout function from AuthContext
    navigate('/login'); // Navigate after logout is complete
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className={`flex justify-between items-center h-20 px-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="flex items-center space-x-4">
          <button onClick={onToggleSidebar} className="text-gray-600 hover:text-primary-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div className="flex items-center space-x-3">
            <img 
              src={images.logo} 
              alt="Ajaka Pharma Logo" 
              className="h-8 w-auto object-contain"
            />
            <div className="leading-tight">
              <div className="text-lg font-bold text-primary-600">AJAKA PHARMA</div>
              <div className="text-xs text-gray-500 font-medium -mt-1">Admin Portal</div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">Welcome, {user?.personalInfo?.name || user?.name || user?.email}</span>
          <button 
            onClick={handleLogout} 
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
