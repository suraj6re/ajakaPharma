// src/components/ExportButton.jsx
import React from 'react';

const ExportButton = ({ data, filename }) => {
  const convertToCSV = (data) => {
    if (!data || data.length === 0) {
      return '';
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(fieldName => JSON.stringify(row[fieldName])).join(',')
      )
    ];
    return csvRows.join('\n');
  };

  const handleExport = () => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleExport} className="btn-secondary">
      Export to CSV
    </button>
  );
};

export default ExportButton;
