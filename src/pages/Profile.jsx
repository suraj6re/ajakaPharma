import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../services/AuthContext';
import { getMyProfile, getVisitReports } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [visitStats, setVisitStats] = useState({
    totalVisits: 0,
    thisMonth: 0,
    thisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState(null);

  useEffect(() => {
    fetchProfileData();
    fetchVisitStats();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await getMyProfile();
      const userData = response.data?.data || response.data;
      
      setProfileData(userData);
      setTempData(userData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fallback to user from context
      setProfileData(user);
      setTempData(user);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitStats = async () => {
    if (!user) return;
    
    try {
      const response = await getVisitReports({ mr: user._id || user.id });
      const visits = response.data?.data?.visits || 
                     response.data?.visits || 
                     response.data?.data || 
                     response.data || 
                     [];
      
      if (!Array.isArray(visits)) return;
      
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      setVisitStats({
        totalVisits: visits.length,
        thisMonth: visits.filter(v => new Date(v.visitDetails?.visitDate || v.visitDate) >= thisMonth).length,
        thisWeek: visits.filter(v => new Date(v.visitDetails?.visitDate || v.visitDate) >= thisWeek).length
      });
    } catch (err) {
      console.error('Error fetching visit stats:', err);
    }
  };

  const handleEdit = () => {
    setTempData(profileData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // In a real app, you would call an API to update the profile
      // For now, just update local state
      setProfileData(tempData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setTempData({
      ...tempData,
      [field]: value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Sidebar />
        <main className="ml-64 pt-16 p-6">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      
      <main className="ml-64 pt-16 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserCircleIcon className="w-8 h-8 mr-3 text-primary-600" />
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your personal information and account settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">
                    {profileData?.name?.charAt(0) || 'M'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{profileData?.name || 'MR User'}</h3>
                <p className="text-gray-600 mt-1">{profileData?.role || 'Medical Representative'}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {profileData?.territory || profileData?.region || 'Territory not assigned'}
                </p>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center text-sm">
                      <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-700">{profileData?.email || 'N/A'}</span>
                    </div>
                    {profileData?.phone && (
                      <div className="flex items-center text-sm">
                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-700">{profileData.phone}</span>
                      </div>
                    )}
                    {profileData?.employeeId && (
                      <div className="flex items-center text-sm">
                        <BriefcaseIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-700">ID: {profileData.employeeId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6"
              >
                <h4 className="font-semibold text-gray-900 mb-4">Visit Statistics</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Total Visits</span>
                      <span className="text-lg font-bold text-primary-600">{visitStats.totalVisits}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="text-lg font-bold text-green-600">{visitStats.thisMonth}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="text-lg font-bold text-blue-600">{visitStats.thisWeek}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Profile Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  {!isEditing ? (
                    <button 
                      onClick={handleEdit} 
                      className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button 
                        onClick={handleSave} 
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Save
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData?.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="form-input"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profileData?.name || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Employee ID</label>
                    <p className="text-gray-900 py-2">{profileData?.employeeId || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="form-label">Email Address</label>
                    <p className="text-gray-900 py-2">{profileData?.email || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={tempData?.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="form-input"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profileData?.phone || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Role</label>
                    <p className="text-gray-900 py-2">{profileData?.role || 'MR'}</p>
                  </div>

                  <div>
                    <label className="form-label">Territory</label>
                    <p className="text-gray-900 py-2">{profileData?.territory || profileData?.region || 'Not assigned'}</p>
                  </div>

                  {profileData?.city && (
                    <div>
                      <label className="form-label">City</label>
                      <p className="text-gray-900 py-2">{profileData.city}</p>
                    </div>
                  )}

                  {profileData?.createdAt && (
                    <div>
                      <label className="form-label">Member Since</label>
                      <p className="text-gray-900 py-2">
                        {new Date(profileData.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Account Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6"
              >
                <h4 className="font-semibold text-gray-900 mb-4">Account Settings</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center">
                    <span className="mr-3">🔒</span>
                    Change Password
                  </button>
                  <button className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center">
                    <span className="mr-3">🔔</span>
                    Notification Preferences
                  </button>
                  <button className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center">
                    <span className="mr-3">🌙</span>
                    Display Settings
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
