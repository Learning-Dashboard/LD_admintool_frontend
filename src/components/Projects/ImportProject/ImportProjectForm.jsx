import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function ImportProjectForm({ onDataParsed }) {
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      try {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // El primer array són els noms de columna, pots adaptar-ho segons el teu format
        onDataParsed(jsonData);
      } catch (err) {
        setError('Error al llegir l\'Excel');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
      {error && <div>{error}</div>}
    </div>
  );
}

export default ImportProjectForm;
