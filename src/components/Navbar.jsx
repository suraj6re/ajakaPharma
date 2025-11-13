import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import images from '../utils/images';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Use useAuth hook

  const handleLogout = async () => {
    await logout(); // Use the logout function from AuthContext
    navigate('/login'); // Navigate after logout is complete
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <img 
                src={images.logo} 
                alt="Ajaka Pharma Logo" 
                className="h-10 w-auto object-contain"
              />
              <div className="leading-tight">
                <div className="text-xl font-bold text-primary-600 tracking-wide leading-none">AJAKA PHARMA</div>
                <div className="text-xs text-gray-500 font-medium mt-1">MR Portal</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-gray-700 font-medium">{user?.name || 'User'}</span>
              <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                {user?.role || 'MR'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
