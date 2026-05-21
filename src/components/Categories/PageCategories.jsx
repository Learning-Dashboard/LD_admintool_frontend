import React, { useState } from "react";
import AdministrateCategories from "./AdministrateCategories";
import { importarCategoriesMetriques, importarCategoriesFactors, importarCategoriesStrategicIndicators } from "../../services/CategoryService";
import MetricsCategories from "../../assets/MetricsCategories.json";
import FactorsCategories from "../../assets/FactorsCategories.json";
import StrategicIndicatorsCategories from "../../assets/StrategicIndicatorsCategories.json";
import '../../styles.css';

function PageCategories({ onBack }) {
  const [view, setView] = useState(null); // null o "administrate"
  const [importResult, setImportResult] = useState("");

  const handleImport = async () => {
    try {
      await importarCategoriesMetriques(MetricsCategories);
      await importarCategoriesFactors(FactorsCategories);
      await importarCategoriesStrategicIndicators(StrategicIndicatorsCategories);
      setImportResult("Categories correctly imported!");
      setTimeout(() => setImportResult(""), 3500);
    } catch (err) {
      setImportResult("Error importing: " + err.message);
    }
  };

  if (view === "administrate") {
    return <AdministrateCategories onBack={() => setView(null)} />;
  }

  return (
    <div>
      <h3>Categories</h3>
      <div>
        <button className="custom-button" onClick={handleImport}>
          Import Categories
        </button>
        <button className="custom-button" onClick={() => setView("administrate")}>
          Manage Categories
        </button>
        {importResult && (
          <div style={{ marginTop: "1.5em", marginBottom: "1em" }}>
            <p>{importResult}</p>
          </div>
        )}
      </div>
      <div>
        <button className="back-button" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

export default PageCategories;
