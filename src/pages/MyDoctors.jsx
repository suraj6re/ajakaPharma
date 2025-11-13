import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getDoctorsForMR, addDoctorForMR } from '../services/api';
import { useAuth } from '../services/AuthContext';

const MyDoctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', location: '' });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await getDoctorsForMR(user._id || user.id);
        setDoctors(response.data.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch doctors.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDoctors();
    }
  }, [user]);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const doctorData = {
        ...newDoctor,
        assignedMR: user._id || user.id
      };
      const response = await addDoctorForMR(doctorData);
      setDoctors([...doctors, response.data.data]);
      setNewDoctor({ name: '', specialty: '', location: '' });
      setShowAddForm(false);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding doctor');
      console.error('Error adding doctor:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main className="ml-64 pt-16 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Doctors</h1>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            {showAddForm ? 'Cancel' : 'Add Doctor'}
          </button>
        </div>

        {showAddForm && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Doctor</h2>
            <form onSubmit={handleAddDoctor}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Specialty"
                  value={newDoctor.specialty}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newDoctor.location}
                  onChange={(e) => setNewDoctor({ ...newDoctor, location: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <button type="submit" className="btn-primary mt-4">Save Doctor</button>
            </form>
          </div>
        )}

        {loading && <p>Loading doctors...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctor List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.length > 0 ? (
                    doctors.map((doctor) => (
                      <tr key={doctor._id || doctor.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialty || doctor.specialization || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.location || doctor.city || doctor.address || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                        No doctors found. Add your first doctor above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyDoctors;
