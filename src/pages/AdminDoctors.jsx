import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import {
  getAllDoctors,
  addDoctorAdmin,
  updateDoctorAdmin,
  deleteDoctorAdmin,
} from "../services/api";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState({
    name: "",
    specialization: "",
    contact: "",
    address: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await getAllDoctors();
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDoctor({ ...currentDoctor, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      try {
        const response = await updateDoctorAdmin(
          currentDoctor._id,
          currentDoctor
        );
        const updatedDoctor = response.data.data;
        setDoctors(
          doctors.map((doc) =>
            doc._id === updatedDoctor._id ? updatedDoctor : doc
          )
        );
      } catch (error) {
        console.error("Error updating doctor:", error);
      }
    } else {
      try {
        const response = await addDoctorAdmin(currentDoctor);
        const newDoctor = response.data.data;
        setDoctors([...doctors, newDoctor]);
      } catch (error) {
        console.error("Error adding doctor:", error);
      }
    }
    closeModal();
  };

  const handleEdit = (doctor) => {
    setIsEdit(true);
    setCurrentDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoctorAdmin(id);
      setDoctors(doctors.filter((doc) => doc._id !== id));
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  const openModal = () => {
    setIsEdit(false);
    setCurrentDoctor({ name: "", specialization: "", contact: "", address: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <AdminSidebar isOpen={isSidebarOpen} />
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-16'} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Doctors</h1>
          <button onClick={openModal} className="btn-primary">+ Add Doctor</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Specialization</th>
                  <th className="py-2 px-4 border-b text-left">Contact</th>
                  <th className="py-2 px-4 border-b text-left">Address</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id}>
                    <td className="py-2 px-4 border-b">{doc.name}</td>
                    <td className="py-2 px-4 border-b">{doc.specialization || doc.specialty}</td>
                    <td className="py-2 px-4 border-b">{doc.contact || doc.phone}</td>
                    <td className="py-2 px-4 border-b">{doc.address || doc.city}</td>
                    <td className="py-2 px-4 border-b">
                      <button onClick={() => handleEdit(doc)} className="btn-secondary mr-2">Edit</button>
                      <button onClick={() => handleDelete(doc._id)} className="btn-danger-secondary">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Doctor" : "Add Doctor"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Name *</label>
                  <input type="text" name="name" value={currentDoctor.name} onChange={handleInputChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Specialization</label>
                  <input type="text" name="specialization" value={currentDoctor.specialization} onChange={handleInputChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Contact</label>
                  <input type="text" name="contact" value={currentDoctor.contact} onChange={handleInputChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Address</label>
                  <input type="text" name="address" value={currentDoctor.address} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{isEdit ? "Update" : "Add"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDoctors;