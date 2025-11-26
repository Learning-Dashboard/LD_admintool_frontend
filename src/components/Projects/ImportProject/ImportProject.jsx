import React, { useState } from "react";
import ImportProjectForm from "./ImportProjectForm";
import ImportProjectPreview from "./ImportProjectPreview";
import { parseTeamsFromRows } from "../../../utils/excelParser";
import { importarProjectes } from "../../../services/ProjectService";

function ImportProject({ onBack }) {
  const [parsedData, setParsedData] = useState([]);
  const [importResult, setImportResult] = useState("");

  const handleDataParsed = (rows) => {
    const projects = parseTeamsFromRows(rows);
    setParsedData(projects);
  };

  const handleConfirm = async () => {
    try {
      await importarProjectes(parsedData);
      setImportResult("Importació completada correctament!");
      setTimeout(() => setImportResult(""), 3500);
    } catch (err) {
      setImportResult("Error durant la importació: " + err.message);
    }
  };

  const handleCancel = () => setParsedData([]);

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
      {importResult && <p>{importResult}</p>}
      <button style={{ marginTop: "2rem" }} onClick={onBack}>Tornar</button>
    </div>
  );
}

export default ImportProject;
