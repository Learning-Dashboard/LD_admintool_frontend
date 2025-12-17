import React, { useState } from "react";
import ImportProjectForm from "./ImportProjectForm";
import ImportProjectPreview from "./ImportProjectPreview";
import ImportResultModal from "./ImportResultModal";
import { parseTeamsFromRows } from "../../../utils/excelParser";
import { importarProjectes } from "../../../services/ProjectService";

function ImportProject({ onNextStep }) {
  const [parsedData, setParsedData] = useState([]);
  const [importResult, setImportResult] = useState(null);

  const handleDataParsed = (rows) => {
    const projects = parseTeamsFromRows(rows);
    setParsedData(projects);
  };

  const handleConfirm = async (dataWithTokens) => {
    try {
      const response = await importarProjectes(dataWithTokens);

      // Show results in modal
      setImportResult({
        type: 'success',
        data: response.data
      });

      // Clear preview after showing modal
      setParsedData([]);

    } catch (err) {
      console.error("Error importing projects:", err);
      setImportResult({
        type: 'error',
        message: err.response?.data?.message || err.message
      });
    }
  };

  const handleCancel = () => {
    setParsedData([]);
    setImportResult(null);
  };

  const handleCloseModal = () => {
    setImportResult(null);
  };

  return (
    <div>
      {parsedData.length === 0 ? (
        <ImportProjectForm onDataParsed={handleDataParsed} />
      ) : (
        <ImportProjectPreview
          data={parsedData}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* Modal amb els resultats */}
      {importResult && importResult.type === 'success' && (
        <ImportResultModal
          result={importResult}
          onClose={handleCloseModal}
          onNextStep={onNextStep}
        />
      )}

      {/* Error general (només si no és success) */}
      {importResult && importResult.type === 'error' && (
        <div style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f8d7da",
          border: "2px solid #dc3545",
          borderRadius: "5px",
          color: "#721c24"
        }}>
          <strong>❌ Error:</strong> {importResult.message}
        </div>
      )}


    </div>
  );
}

export default ImportProject;
