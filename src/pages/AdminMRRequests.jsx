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
  XMarkIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import { getMRRequests, approveMRRequest, rejectMRRequest, deleteMRRequest } from '../services/api';

const AdminMRRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getMRRequests();
      const data = response.data?.data?.requests || response.data?.requests || response.data?.data || response.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching MR requests:', error);
      toast.error('Failed to load MR requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    if (!confirm(`Approve MR application for ${request.name}?\n\nThis will create a user account and send login credentials via email.`)) {
      return;
    }

    setProcessingId(request._id);
    try {
      const response = await approveMRRequest(request._id);
      const credentials = response.data?.data?.credentials || {};
      
      toast.success(
        `✅ Request approved!\n\nCredentials sent to ${request.email}\nPassword: ${credentials.tempPassword}`,
        { duration: 10000 }
      );
      
      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled

    setProcessingId(request._id);
    try {
      await rejectMRRequest(request._id, reason);
      toast.success('Request rejected and email sent');
      
      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (request) => {
    if (!confirm(`Delete request from ${request.name}?\n\nThis action cannot be undone.`)) {
      return;
    }

    setProcessingId(request._id);
    try {
      await deleteMRRequest(request._id);
      toast.success('Request deleted successfully');
      
      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
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
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <AdminSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ClipboardDocumentCheckIcon className="w-8 h-8 mr-3 text-primary-600" />
              MR Access Requests
            </h1>
            <p className="text-gray-600 mt-1">Review and manage Medical Representative access requests</p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'pending'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pending Requests
                  <span className="ml-2 bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full text-xs font-semibold">
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('processed')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'processed'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Processed Requests
                  <span className="ml-2 bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-xs font-semibold">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                          key={request._id}
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
                                  <div className="text-sm text-gray-500 truncate max-w-xs" title={request.experience}>
                                    {request.experience.substring(0, 50)}{request.experience.length > 50 ? '...' : ''}
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
                            {formatDate(request.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                            {request.processedAt && (
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(request.processedAt)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {request.status === 'pending' ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApprove(request)}
                                  disabled={processingId === request._id}
                                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs transition-colors disabled:opacity-50"
                                >
                                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                                  {processingId === request._id ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleReject(request)}
                                  disabled={processingId === request._id}
                                  className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition-colors disabled:opacity-50"
                                >
                                  <XCircleIcon className="w-4 h-4 mr-1" />
                                  {processingId === request._id ? 'Processing...' : 'Reject'}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDelete(request)}
                                disabled={processingId === request._id}
                                className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs transition-colors disabled:opacity-50"
                                title="Delete request"
                              >
                                {processingId === request._id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <>
                                    <XMarkIcon className="w-4 h-4 mr-1" />
                                    Delete
                                  </>
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
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminMRRequests;
