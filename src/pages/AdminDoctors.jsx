import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import {
  getAllDoctors,
  addDoctorAdmin,
  updateDoctorAdmin,
  deleteDoctorAdmin,
} from "../services/api";
import toast from 'react-hot-toast';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentDoctor, setCurrentDoctor] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
    place: "",
    qualification: ""
  });

  // Get unique qualifications and locations for filters
  const uniqueQualifications = [...new Set(doctors.map(d => d.qualification).filter(Boolean))].sort();
  const uniqueLocations = [...new Set(doctors.map(d => d.place).filter(Boolean))].sort();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = [...doctors];
    
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (qualificationFilter) {
      filtered = filtered.filter(doc =>
        doc.qualification === qualificationFilter
      );
    }
    
    if (locationFilter) {
      filtered = filtered.filter(doc =>
        doc.place === locationFilter
      );
    }
    
    setFilteredDoctors(filtered);
  }, [searchTerm, qualificationFilter, locationFilter, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getAllDoctors();
      // Handle nested response structure
      const data = response.data?.data?.doctors || response.data?.doctors || response.data?.data || response.data || [];
      console.log('Doctors fetched:', data); // Debug log
      console.log('Sample doctor:', data[0]); // Debug first doctor
      
      // Check qualifications
      const quals = data.map(d => d.qualification).filter(Boolean);
      console.log('Qualifications found:', quals);
      
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error('Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDoctor({ ...currentDoctor, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        const response = await updateDoctorAdmin(currentDoctor._id, currentDoctor);
        const updatedDoctor = response.data?.data || response.data;
        setDoctors(doctors.map((doc) => doc._id === updatedDoctor._id ? updatedDoctor : doc));
        toast.success('Doctor updated successfully!');
      } else {
        const response = await addDoctorAdmin(currentDoctor);
        const newDoctor = response.data?.data || response.data;
        setDoctors([...doctors, newDoctor]);
        toast.success('Doctor added successfully!');
      }
      closeModal();
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast.error(error.response?.data?.message || 'Failed to save doctor');
    }
  };

  const handleEdit = (doctor) => {
    setIsEdit(true);
    setCurrentDoctor({
      ...doctor,
      specialization: doctor.specialization || '',
      phone: doctor.phone || '',
      place: doctor.place || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      await deleteDoctorAdmin(id);
      setDoctors(doctors.filter((doc) => doc._id !== id));
      toast.success('Doctor deleted successfully!');
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast.error('Failed to delete doctor');
    }
  };

  const openModal = () => {
    setIsEdit(false);
    setCurrentDoctor({ name: "", specialization: "", phone: "", email: "", place: "", qualification: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDoctor({ name: "", specialization: "", phone: "", email: "", place: "", qualification: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <AdminSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <UserGroupIcon className="w-8 h-8 mr-3 text-primary-600" />
                  Manage Doctors
                </h1>
                <p className="text-gray-600 mt-1">Add, edit, and manage doctor database</p>
              </div>
              <button 
                onClick={openModal} 
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Doctor
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6"
          >
            <div className="flex items-center mb-4">
              <FunnelIcon className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Search & Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <select
                value={qualificationFilter}
                onChange={(e) => setQualificationFilter(e.target.value)}
                className="form-input"
              >
                <option value="">All Qualifications</option>
                {uniqueQualifications.length > 0 ? (
                  uniqueQualifications.map(qualification => (
                    <option key={qualification} value={qualification}>{qualification}</option>
                  ))
                ) : (
                  <option disabled>No qualifications found</option>
                )}
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="form-input"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </p>
              <button
                onClick={() => { setSearchTerm(''); setQualificationFilter(''); setLocationFilter(''); }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>

          {/* Doctors Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredDoctors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDoctors.map((doc, index) => (
                      <tr key={doc._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 font-semibold">{doc.name?.charAt(0) || 'D'}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                              <div className="text-sm text-gray-500">{doc.qualification || 'MBBS'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {doc.qualification || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="space-y-1">
                            {doc.phone && (
                              <div className="flex items-center">
                                <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                                {doc.phone}
                              </div>
                            )}
                            {doc.email && (
                              <div className="flex items-center">
                                <EnvelopeIcon className="w-4 h-4 mr-1 text-gray-400" />
                                {doc.email}
                              </div>
                            )}
                            {!doc.phone && !doc.email && 'No contact info'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                            {doc.place || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit(doc)} 
                              className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(doc._id)} 
                              className="inline-flex items-center text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                            >
                              <TrashIcon className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No doctors found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'Try a different search term' : 'Add your first doctor to get started'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Stats */}
          {!loading && doctors.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Total Doctors</p>
                <p className="text-2xl font-bold text-primary-600">{doctors.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Qualifications</p>
                <p className="text-2xl font-bold text-primary-600">
                  {new Set(doctors.map(d => d.qualification).filter(Boolean)).size}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-primary-600">
                  {new Set(doctors.map(d => d.place).filter(Boolean)).size}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {isEdit ? "Edit Doctor" : "Add New Doctor"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Doctor Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={currentDoctor.name} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="form-label">Qualification</label>
                    <input 
                      type="text" 
                      name="qualification" 
                      value={currentDoctor.qualification} 
                      onChange={handleInputChange} 
                      className="form-input"
                      placeholder="MBBS, MD, etc."
                    />
                  </div>
                  <div>
                    <label className="form-label">Specialization</label>
                    <input 
                      type="text" 
                      name="specialization" 
                      value={currentDoctor.specialization} 
                      onChange={handleInputChange} 
                      className="form-input"
                      placeholder="Cardiologist, Neurologist, etc."
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={currentDoctor.phone} 
                      onChange={handleInputChange} 
                      className="form-input"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={currentDoctor.email} 
                      onChange={handleInputChange} 
                      className="form-input"
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                  <div>
                    <label className="form-label">Location</label>
                    <input 
                      type="text" 
                      name="place" 
                      value={currentDoctor.place} 
                      onChange={handleInputChange} 
                      className="form-input"
                      placeholder="City or Hospital"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    {isEdit ? "Update Doctor" : "Add Doctor"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDoctors;
