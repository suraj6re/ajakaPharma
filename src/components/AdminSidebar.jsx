import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentChartBarIcon, 
  UserGroupIcon, 
  BeakerIcon, 
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import images from '../utils/images';

const AdminSidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin-dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/admin-reports', label: 'Reports', icon: DocumentChartBarIcon },
    { path: '/admin-orders', label: 'Orders', icon: ShoppingCartIcon },
    { path: '/admin-doctors', label: 'Doctors', icon: UserGroupIcon },
    { path: '/admin-products', label: 'Products', icon: BeakerIcon },
    { path: '/admin-mrs', label: 'Manage MRs', icon: UsersIcon },
    { path: '/admin/mr-requests', label: 'MR Requests', icon: ClipboardDocumentCheckIcon },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 fixed left-0 top-0 h-full z-40 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200">
        {isOpen ? (
          <div className="flex items-center space-x-3">
            <img 
              src={images.logo} 
              alt="Ajaka Pharma Logo" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <div className="text-lg font-bold text-primary-600">Admin Panel</div>
              <div className="text-xs text-gray-500">Ajaka Pharma</div>
            </div>
          </div>
        ) : (
          <img 
            src={images.logo} 
            alt="Ajaka Pharma Logo" 
            className="h-10 w-auto object-contain mx-auto"
          />
        )}
      </div>



      {/* Navigation */}
      <nav className="py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 ${
                  isActive(item.path) ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600' : ''
                }`}
                title={!isOpen ? item.label : ''}
              >
                <item.icon className={`w-5 h-5 ${isOpen ? 'mr-3' : ''} flex-shrink-0`} />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-4 w-full px-4">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 ${
            !isOpen && 'justify-center'
          }`}
          title={!isOpen ? 'Logout' : ''}
        >
          <ArrowRightOnRectangleIcon className={`w-5 h-5 ${isOpen ? 'mr-3' : ''} flex-shrink-0`} />
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
