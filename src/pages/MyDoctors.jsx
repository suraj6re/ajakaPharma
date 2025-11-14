import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  UserGroupIcon, 
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getDoctorsForMR, addDoctorForMR } from '../services/api';
import { useAuth } from '../services/AuthContext';
import toast from 'react-hot-toast';

const MyDoctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDoctor, setNewDoctor] = useState({ 
    name: '', 
    specialty: '', 
    location: '',
    phone: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [user]);

  const fetchDoctors = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await getDoctorsForMR(user._id || user.id);
      const doctorsData = response.data?.data?.doctors || 
                         response.data?.doctors || 
                         response.data?.data || 
                         response.data || 
                         [];
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    
    if (!newDoctor.name || !newDoctor.specialty || !newDoctor.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      const doctorData = {
        name: newDoctor.name,
        specialization: newDoctor.specialty,
        place: newDoctor.location,
        phone: newDoctor.phone,
        email: newDoctor.email,
        assignedMR: user._id || user.id
      };
      
      const response = await addDoctorForMR(doctorData);
      const addedDoctor = response.data?.data || response.data;
      
      setDoctors([...doctors, addedDoctor]);
      setNewDoctor({ name: '', specialty: '', location: '', phone: '', email: '' });
      setShowAddForm(false);
      toast.success('Doctor added successfully!');
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to add doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      doctor.name?.toLowerCase().includes(search) ||
      (doctor.specialty || doctor.specialization)?.toLowerCase().includes(search) ||
      (doctor.location || doctor.place || doctor.city)?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      
      <main className="ml-64 pt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <UserGroupIcon className="w-8 h-8 mr-3 text-primary-600" />
                  My Doctors
                </h1>
                <p className="text-gray-600 mt-1">Manage your assigned doctors database</p>
              </div>
              <button 
                onClick={() => setShowAddForm(!showAddForm)} 
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                {showAddForm ? 'Cancel' : 'Add Doctor'}
              </button>
            </div>
          </div>

          {/* Add Doctor Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Doctor</h2>
              <form onSubmit={handleAddDoctor}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Doctor Name *</label>
                    <input
                      type="text"
                      placeholder="Dr. John Doe"
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Specialty *</label>
                    <input
                      type="text"
                      placeholder="Cardiologist"
                      value={newDoctor.specialty}
                      onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      placeholder="Mumbai"
                      value={newDoctor.location}
                      onChange={(e) => setNewDoctor({ ...newDoctor, location: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={newDoctor.phone}
                      onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      placeholder="doctor@hospital.com"
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4 space-x-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Doctor'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name, specialty, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Doctors List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredDoctors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialty
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDoctors.map((doctor, index) => (
                      <motion.tr 
                        key={doctor._id || doctor.id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 font-semibold">
                                {doctor.name?.charAt(0) || 'D'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                              <div className="text-sm text-gray-500">{doctor.qualification || 'MBBS'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {doctor.specialty || doctor.specialization || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                            {doctor.location || doctor.place || doctor.city || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="space-y-1">
                            {doctor.phone && (
                              <div className="flex items-center">
                                <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                                {doctor.phone}
                              </div>
                            )}
                            {doctor.email && (
                              <div className="flex items-center">
                                <EnvelopeIcon className="w-4 h-4 mr-1 text-gray-400" />
                                {doctor.email}
                              </div>
                            )}
                            {!doctor.phone && !doctor.email && 'No contact info'}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {searchTerm ? 'No doctors found matching your search' : 'No doctors added yet'}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {searchTerm ? 'Try a different search term' : 'Start by adding your first doctor'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Your First Doctor
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          {!loading && doctors.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Total Doctors</p>
                <p className="text-2xl font-bold text-primary-600">{doctors.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Specialties</p>
                <p className="text-2xl font-bold text-primary-600">
                  {new Set(doctors.map(d => d.specialty || d.specialization)).size}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-primary-600">
                  {new Set(doctors.map(d => d.location || d.place || d.city)).size}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyDoctors;
