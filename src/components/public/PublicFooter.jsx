import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import images from '../../utils/images';

const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Login', href: '/login' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Company Info */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src={images.logo} 
                alt="Ajaka Pharma Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <div className="text-xl font-bold text-white leading-tight">
                  AJAKA PHARMA
                </div>
                <div className="text-xs text-gray-300 font-medium -mt-1">
                  Healthcare Excellence
                </div>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="flex justify-center space-x-8 mb-6">
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* Certifications */}
            <div className="flex justify-center space-x-4 mb-6">
              <span className="bg-primary-600 bg-opacity-20 text-xs px-3 py-1 rounded-full text-primary-300 border border-primary-500">ISO 9001</span>
              <span className="bg-primary-600 bg-opacity-20 text-xs px-3 py-1 rounded-full text-primary-300 border border-primary-500">WHO-GMP</span>
              <span className="bg-primary-600 bg-opacity-20 text-xs px-3 py-1 rounded-full text-primary-300 border border-primary-500">FDA</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <div className="text-sm text-gray-400 mb-4">
            © {currentYear} Ajaka Pharma Pvt Ltd. All rights reserved.
          </div>
          
          <div className="text-xs text-gray-500">
            <p className="leading-relaxed max-w-2xl mx-auto">
              Ajaka Pharma is committed to providing quality healthcare solutions across India. 
              All products are manufactured under strict quality control and regulatory compliance.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;