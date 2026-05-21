import React, { useState, useEffect } from 'react';
import { importMetrics } from '../../services/MetricsService';
import { importQualityFactors } from '../../services/FactorsService';
import { fetchStrategicIndicators } from '../../services/StrategicIndicatorsService';
import { syncProjectCategories } from '../../services/ProjectService';

const ImportData = ({ onNext, onBack, onRefreshStatus, onCompleted }) => {
    // Tracks which steps are done: metrics, factors, indicators
    const [metricsDone, setMetricsDone] = useState(false);
    const [factorsDone, setFactorsDone] = useState(false);
    const [indicatorsDone, setIndicatorsDone] = useState(false);
    const [allDone, setAllDone] = useState(false);

    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => setLogs(prev => [...prev, msg]);

    useEffect(() => {
        if (metricsDone && factorsDone && indicatorsDone) {
            setAllDone(true);
            if (onCompleted) onCompleted();
        }
    }, [metricsDone, factorsDone, indicatorsDone, onCompleted]);

    const handleImportData = async () => {
        setLoading(true);
        setLogs([]); // Clear previous logs
        setMetricsDone(false);
        setFactorsDone(false);
        setIndicatorsDone(false);
        setAllDone(false);

        // Step 1: Metrics
        try {
            addLog("🚀 Starting Import Process...");
            addLog("📥 Importing Metrics...");
            await importMetrics();
            addLog("✅ Metrics Imported Successfully.");
            setMetricsDone(true);
            if (onRefreshStatus) onRefreshStatus();
        } catch (error) {
            addLog(`❌ Error importing Metrics: ${error.message}`);
            setLoading(false);
            return; // Stop on error
        }

        // Step 2: Factors
        try {
            addLog("📥 Importing Quality Factors...");
            await importQualityFactors();
            addLog("✅ Quality Factors Imported Successfully.");
            setFactorsDone(true);
            if (onRefreshStatus) onRefreshStatus();
        } catch (error) {
            addLog(`❌ Error importing Quality Factors: ${error.message}`);
            setLoading(false);
            return; // Stop on error
        }

        // Step 3: Indicators
        try {
            addLog("📥 Fetching Strategic Indicators...");
            await fetchStrategicIndicators();
            addLog("✅ Strategic Indicators Fetched Successfully.");
            setIndicatorsDone(true);
            if (onRefreshStatus) onRefreshStatus();
        } catch (error) {
            addLog(`❌ Error fetching Strategic Indicators: ${error.message}`);
            setLoading(false);
            return; // Stop on error
        }

        try {
            addLog("🔄 Synchronizing project metric/factor categories...");
            await syncProjectCategories();
            addLog("✅ Categories synchronized across teams.");
        } catch (error) {
            addLog(`⚠️ Error synchronizing categories: ${error.message}`);
        }

        addLog("🎉 All Data Imported Successfully!");
        setLoading(false);
    };

    return (
        <div className="wizard-step import-data-step">
            <h3>Step 2: Import Data</h3>
            <p>Click the button below to import Metrics, Quality Factors, and Strategic Indicators sequentially.</p>

            <div className="import-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <button
                    className="custom-button"
                    onClick={handleImportData}
                    disabled={loading || allDone}
                    style={{ backgroundColor: allDone ? '#28a745' : loading ? '#6c757d' : undefined, minWidth: '200px' }}
                >
                    {loading ? 'Importing Data...' : allDone ? '✅ Import Complete' : 'Import Data'}
                </button>
            </div>

            <div className="import-logs" style={{ marginTop: '2rem', padding: '1rem', borderRadius: '4px', height: '200px', overflowY: 'auto', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                {logs.length === 0 && <div style={{ color: '#888', fontStyle: 'italic' }}>Logs will appear here...</div>}
                {logs.map((log, idx) => (
                    <div key={idx} className="log-entry" style={{ marginBottom: '4px', fontSize: '0.9rem' }}>{log}</div>
                ))}
                {loading && <div className="log-entry" style={{ fontStyle: 'italic', color: '#007bff' }}>Processing...</div>}
            </div>

            <div className="wizard-controls" style={{ marginTop: '2rem' }}>
                <button className="custom-button secondary" onClick={onBack} disabled={loading}>Back</button>
                {allDone && (
                    <button className="custom-button" onClick={onNext}>Next Step</button>
                )}
            </div>
        </div>
    );
};

export default ImportData;
