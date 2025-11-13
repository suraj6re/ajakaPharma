import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService';
// Using local storage for demo - in production would use Firestore
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

const AdminMRRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFromLocalStorage = () => {
      const savedRequests = JSON.parse(localStorage.getItem('mr_requests') || '[]');
      savedRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRequests(savedRequests);
      setLoading(false);
    };

    loadFromLocalStorage();
    
    // Poll for changes every 2 seconds
    const interval = setInterval(() => {
      const updatedRequests = JSON.parse(localStorage.getItem('mr_requests') || '[]');
      updatedRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRequests(updatedRequests);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const generatePassword = () => {
    return Math.random().toString(36).slice(-10).toUpperCase();
  };

  const handleApprove = async (request) => {
    setProcessingId(request.id);
    setError('');
    try {
      // Generate temporary password
      const tempPassword = generatePassword();
      
      // Update localStorage
      const savedRequests = JSON.parse(localStorage.getItem('mr_requests') || '[]');
      const updatedRequests = savedRequests.map(req => 
        req.id === request.id 
          ? { 
              ...req, 
              status: 'approved', 
              approved_at: new Date().toISOString(),
              temp_password: tempPassword 
            }
          : req
      );
      localStorage.setItem('mr_requests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
      
      toast.success(`✅ Request approved successfully!\nCredentials: ${request.email} / ${tempPassword}`, {
        duration: 8000,
      });
      
    } catch (error) {
      console.error('Error approving request:', error);
      setError('Error approving request: ' + error.message);
      toast.error('Failed to approve request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request) => {
    setProcessingId(request.id);
    setError('');
    try {
      // Update localStorage
      const savedRequests = JSON.parse(localStorage.getItem('mr_requests') || '[]');
      const updatedRequests = savedRequests.map(req => 
        req.id === request.id 
          ? { 
              ...req, 
              status: 'rejected', 
              rejected_at: new Date().toISOString()
            }
          : req
      );
      localStorage.setItem('mr_requests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
      
      toast.success(`Request rejected.`);
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Error rejecting request: ' + error.message);
      toast.error('Failed to reject request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (request) => {
    if (!confirm(`Are you sure you want to delete the request from ${request.name}?\n\nThis action cannot be undone.`)) {
      return;
    }

    setProcessingId(request.id);
    setError('');
    try {
      // Delete from localStorage
      const savedRequests = JSON.parse(localStorage.getItem('mr_requests') || '[]');
      const updatedRequests = savedRequests.filter(req => req.id !== request.id);
      localStorage.setItem('mr_requests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
      
      toast.success(`Request from ${request.name} removed from list`);
    } catch (error) {
      console.error('Error deleting request:', error);
      setError('Error deleting request: ' + error.message);
      toast.error('Failed to delete request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => {
    if (activeTab === 'pending') {
      return request.status === 'pending';
    } else {
      return request.status === 'approved' || request.status === 'rejected';
    }
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <AdminSidebar isOpen={isSidebarOpen} />
      
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-16'}`}>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">MR Access Requests</h1>
            <p className="text-gray-600 mt-2">Review and manage Medical Representative access requests</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pending'
                      ? 'border-[#1E586E] text-[#1E586E]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pending Requests
                  <span className="ml-2 bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full text-xs">
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('processed')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'processed'
                      ? 'border-[#1E586E] text-[#1E586E]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Processed Requests
                  <span className="ml-2 bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-xs">
                    {requests.filter(r => r.status === 'approved' || r.status === 'rejected').length}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab} requests found
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'pending' 
                      ? 'No pending MR access requests at the moment.' 
                      : 'No processed requests to display.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Area
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied On
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.map((request) => (
                        <motion.tr
                          key={request.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-primary-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{request.name}</div>
                                {request.experience && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {request.experience.substring(0, 50)}...
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-900">
                                <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                                {request.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                                {request.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                              {request.area}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {request.status === 'pending' ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApprove(request)}
                                  disabled={processingId === request.id}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 disabled:opacity-50"
                                >
                                  {processingId === request.id ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleReject(request)}
                                  disabled={processingId === request.id}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 disabled:opacity-50"
                                >
                                  {processingId === request.id ? 'Processing...' : 'Reject'}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDelete(request)}
                                disabled={processingId === request.id}
                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                                title="Delete request"
                              >
                                {processingId === request.id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <XMarkIcon className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminMRRequests;