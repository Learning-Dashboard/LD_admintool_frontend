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
            setImportResult("Categories imported successfully!");
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
                    background: importResult.includes("Error") ? "rgba(220, 53, 69, 0.1)" : "rgba(40, 167, 69, 0.1)",
                    color: importResult.includes("Error") ? "#ff6b6b" : "#51cf66",
                    border: importResult.includes("Error") ? "1px solid rgba(220, 53, 69, 0.3)" : "1px solid rgba(40, 167, 69, 0.3)",
                    borderRadius: "6px",
                    textAlign: "center",
                    fontSize: "0.95rem"
                }}>
                    <p style={{ margin: 0 }}>{importResult}</p>
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

