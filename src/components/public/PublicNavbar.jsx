import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  HeartIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import images from '../../utils/images';

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Products', href: '/products' },
    { name: 'Contact', href: '/contact' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-primary-600 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src={images.logo} 
                alt="Ajaka Pharma Logo" 
                className="h-12 w-auto object-contain"
              />
              <div className="hidden sm:block">
                <div className="text-xl font-bold text-white leading-tight">
                  AJAKA PHARMA
                </div>
                <div className="text-xs text-primary-200 font-medium -mt-1">
                  Healthcare Excellence
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-white bg-primary-700'
                    : 'text-primary-100 hover:text-white hover:bg-primary-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link
                to="/request-mr-access"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Apply as MR
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center bg-white hover:bg-primary-50 text-primary-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                MR Login
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center border border-white hover:bg-white hover:text-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Login
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-primary-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-primary-600 border-t border-primary-500"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-white bg-primary-700'
                      : 'text-primary-100 hover:text-white hover:bg-primary-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Action Buttons */}
              <Link
                to="/request-mr-access"
                onClick={() => setIsOpen(false)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-200 mb-2 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Apply as MR
              </Link>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-white text-primary-600 hover:bg-primary-50 transition-colors duration-200 mb-2"
              >
                <UserIcon className="w-4 h-4 inline mr-2" />
                MR Login
              </Link>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium border border-white text-white hover:bg-white hover:text-primary-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default PublicNavbar;