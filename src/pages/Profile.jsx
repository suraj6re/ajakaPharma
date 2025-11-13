import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../services/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState(null);

  useEffect(() => {
    const fetchProfileAndReports = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      setError('');
      try {
        // For now, use the user data from AuthContext
        // In a real app, you would fetch from API
        setProfileData({
          _id: user.id,
          name: user.name,
          email: user.email || 'user@example.com',
          employeeId: user.id,
          role: user.role,
          territory: 'North Region'
        });
        setTempData({
          _id: user.id,
          name: user.name,
          email: user.email || 'user@example.com',
          employeeId: user.id,
          role: user.role,
          territory: 'North Region'
        });
        // Mock reports data - in real app, fetch from API
        setReports([]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndReports();
  }, [user]);

  const handleEdit = () => {
    setTempData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(tempData);
    setIsEditing(false);
    // Optionally: send update to backend here
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setTempData({
      ...tempData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profileData} />
      <Sidebar />
      <main className="ml-64 pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings 👤</h1>
            <p className="text-gray-600 mt-1">
              Manage your personal information and account settings
            </p>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : profileData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                    {!isEditing ? (
                      <button onClick={handleEdit} className="btn-primary">
                        ✏️ Edit Profile
                      </button>
                    ) : (
                      <div className="space-x-2">
                        <button onClick={handleSave} className="btn-primary">
                          💾 Save
                        </button>
                        <button onClick={handleCancel} className="btn-secondary">
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
                          name="name"
                          value={tempData.name}
                          onChange={handleChange}
                          className="form-input"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profileData.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Employee ID</label>
                      <p className="text-gray-900 py-2">{profileData.employeeId}</p>
                    </div>
                    <div>
                      <label className="form-label">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={tempData.email}
                          onChange={handleChange}
                          className="form-input"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profileData.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Role</label>
                      <p className="text-gray-900 py-2">{profileData.role}</p>
                    </div>
                  </div>
                </div>
                {/* User's Reports Section */}
                <div className="card mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Visit Reports</h3>
                  {reports.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="py-2 px-4 border-b text-left">Visit Date</th>
                            <th className="py-2 px-4 border-b text-left">Doctor</th>
                            <th className="py-2 px-4 border-b text-left">Products Discussed</th>
                            <th className="py-2 px-4 border-b text-left">Notes</th>
                            <th className="py-2 px-4 border-b text-left">Orders</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map(report => (
                            <tr key={report._id}>
                              <td className="py-2 px-4 border-b">{new Date(report.visitDate).toLocaleDateString()}</td>
                              <td className="py-2 px-4 border-b">{report.doctor.name} ({report.doctor.specialty})</td>
                              <td className="py-2 px-4 border-b">{report.productsDiscussed.map(p => p.name).join(', ')}</td>
                              <td className="py-2 px-4 border-b"><p className="truncate w-48">{report.notes}</p></td>
                              <td className="py-2 px-4 border-b">
                                {report.orders && report.orders.length > 0 ? (
                                  <ul className="list-disc pl-4">
                                    {report.orders.map((order, idx) => (
                                      <li key={idx}>
                                        {order.product && order.product.name ? order.product.name : order.product} &times; {order.quantity}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-gray-400">No orders</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No reports submitted yet.</p>
                  )}
                </div>
              </div>
              {/* Profile Picture & Quick Actions */}
              <div className="lg:col-span-1">
                <div className="card text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-3xl font-bold">
                      {profileData.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{profileData.name}</h3>
                  <p className="text-gray-600">{profileData.role}</p>
                  <p className="text-sm text-gray-500 mt-1">{profileData.territory || ''}</p>
                  <button className="mt-4 w-full btn-secondary text-sm">
                    📷 Change Photo
                  </button>
                </div>
                {/* Account Settings */}
                <div className="card mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Account Settings</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                      🔒 Change Password
                    </button>
                    <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                      🔔 Notification Settings
                    </button>
                    <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                      🌙 Dark Mode
                    </button>
                    <button className="w-full text-left p-2 text-sm text-red-600 hover:bg-red-50 rounded">
                      🗑️ Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Profile;
