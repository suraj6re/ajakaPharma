// src/components/AdminCard.jsx
import React from 'react';

const AdminCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="text-4xl text-gray-300">{icon}</div>
    </div>
  );
};

export default AdminCard;
