import React, { useState } from "react";
import { importarCategoriesMetriques, importarCategoriesFactors, importarCategoriesStrategicIndicators } from "../../services/CategoryService";
import MetricsCategories from "../../assets/MetricsCategories.json";
import FactorsCategories from "../../assets/FactorsCategories.json";
import StrategicIndicatorsCategories from "../../assets/StrategicIndicatorsCategories.json";

const WizardImportCategories = ({ onNext, onBack }) => {
    const [importResult, setImportResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleImport = async () => {
        setLoading(true);
        try {
            await importarCategoriesMetriques(MetricsCategories);
            await importarCategoriesFactors(FactorsCategories);
            await importarCategoriesStrategicIndicators(StrategicIndicatorsCategories);
            setImportResult("Categories correctly imported!");
        } catch (err) {
            setImportResult("Error importing: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wizard-step">
            <h3>Step 3: Import Categories</h3>
            <p>Import the default categories for Metrics, Factors, and Strategic Indicators.</p>

            <div style={{ textAlign: "center", margin: "2rem" }}>
                <button className="custom-button" onClick={handleImport} disabled={loading}>
                    {loading ? "Importing..." : "Import Categories"}
                </button>
            </div>

            {importResult && (
                <div style={{
                    marginTop: "1.5rem",
                    marginBottom: "1rem",
                    padding: "1rem",
                    background: importResult.includes("Error") ? "#f8d7da" : "#d4edda",
                    color: importResult.includes("Error") ? "#721c24" : "#155724",
                    borderRadius: "4px"
                }}>
                    <p>{importResult}</p>
                </div>
            )}

            <div className="wizard-controls">
                <button className="custom-button secondary" onClick={onBack}>Back</button>
                <button className="custom-button" onClick={onNext} disabled={loading || !importResult || importResult.includes("Error")}>Next Step</button>
            </div>
        </div>
    );
};

export default WizardImportCategories;
