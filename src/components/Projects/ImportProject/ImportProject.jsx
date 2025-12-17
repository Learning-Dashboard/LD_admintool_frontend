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
      // Create a mapping of externalId/name to subject BEFORE sending to backend
      // because backend doesn't return subject in the response
      const subjectMapping = {};
      dataWithTokens.forEach(team => {
        const key = team.externalId || team.name;
        subjectMapping[key] = team.subject;
      });

      const response = await importarProjectes(dataWithTokens);

      // Only save to localStorage teams that were successfully imported
      if (response.data.validProjects && response.data.validProjects.length > 0) {
        const mapping = JSON.parse(localStorage.getItem('subject_teams_mapping')) || {};
        response.data.validProjects.forEach(team => {
          const teamKey = team.externalId || team.name;
          const subject = subjectMapping[teamKey];
          const teamName = team.name || team.externalId;

          if (!subject || !teamName) {
            return;
          }
          if (!mapping[subject]) mapping[subject] = [];
          if (!mapping[subject].includes(teamName)) {
            mapping[subject].push(teamName);
          }
        });

        localStorage.setItem('subject_teams_mapping', JSON.stringify(mapping));
      } else {
      }

      // Mostrar resultats en modal
      setImportResult({
        type: 'success',
        data: response.data
      });

      // Netejar la preview després de mostrar el modal
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

      {/* <button style={{ marginTop: "2rem" }} onClick={onBack}>Tornar</button> */}
    </div>
  );
}

export default ImportProject;
