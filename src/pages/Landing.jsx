
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import images from '../utils/images';

const Landing = () => {
  const productImages = images.products;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const slideRef = useRef(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(productImages.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(productImages.length / 3)) % Math.ceil(productImages.length / 3));
  };

  const openImageOverlay = (image, index) => {
    setSelectedImage({ image, index });
  };

  const closeImageOverlay = () => {
    setSelectedImage(null);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Title Image */}
      <section 
        className="relative w-full cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img 
          src={images.titlePage} 
          alt="Ajaka Pharma Title" 
          className="w-full h-auto object-cover"
        />
        
        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center"
            >
              <div className="text-center text-white px-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                    Welcome to Ajaka Pharma
                  </h1>
                  <p className="text-xl md:text-3xl font-light max-w-4xl mx-auto">
                    Delivering Quality Healthcare Across India
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Explore Our Products Section - Horizontal Slideshow */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Explore Our Products
              </h2>
              <div className="w-24 h-1 bg-primary-600 mx-auto"></div>
            </motion.div>
          </div>
          
          {/* Slideshow Container */}
          <div className="relative w-full">
            <div className="overflow-hidden" ref={slideRef}>
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(productImages.length / 3) }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="flex justify-center gap-8 px-4">
                      {productImages.slice(slideIndex * 3, (slideIndex + 1) * 3).map((image, index) => (
                        <motion.div
                          key={slideIndex * 3 + index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="group cursor-pointer flex-1 max-w-md"
                          onClick={() => openImageOverlay(image, slideIndex * 3 + index)}
                        >
                          <div className="relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 bg-white">
                            <img 
                              src={image} 
                              alt={`Ajaka Pharma Product ${slideIndex * 3 + index + 2}`}
                              className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                              <div className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Click to View
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200 z-10"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200 z-10"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
            
            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.ceil(productImages.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    currentSlide === index ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MR Portal Login Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100"
            >
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Medical Representative Portal
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Access your personalized dashboard to manage visits, track performance, 
                and stay connected with our comprehensive MR management system.
              </p>
              
              <Link 
                to="/login" 
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Login to MR Dashboard
                <ArrowRightIcon className="w-5 h-5 ml-3" />
              </Link>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  New to our system? Contact your administrator for access credentials.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Image Section */}
      <section className="w-full">
        <img 
          src={images.footerBg} 
          alt="Ajaka Pharma Company" 
          className="w-full h-auto object-cover"
        />
      </section>

      {/* Contact Information Section */}
      <section className="py-20 bg-primary-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Get in Touch
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Address</h3>
                  <p className="text-primary-100">
                    Headquartered in India<br />
                    Serving healthcare nationwide
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Phone</h3>
                  <p className="text-primary-100">
                    +91 22 1234 5678<br />
                    Mon - Fri, 9AM - 6PM
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Email</h3>
                  <p className="text-primary-100">
                    info@ajakapharma.com<br />
                    support@ajakapharma.com
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/contact" 
                  className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                >
                  Contact Our Team
                </Link>
                <Link 
                  to="/login" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                >
                  Access MR Portal
                </Link>
                <Link 
                  to="/request-mr-access" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg"
                >
                  Apply as Medical Representative
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Image Overlay Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={closeImageOverlay}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.image}
                alt={`Ajaka Pharma Product ${selectedImage.index + 2}`}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
              <button
                onClick={closeImageOverlay}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors duration-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
