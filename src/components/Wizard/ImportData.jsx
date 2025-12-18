import React, { useState, useEffect } from 'react';
import { importMetrics } from '../../services/MetricsService';
import { importQualityFactors } from '../../services/FactorsService';
import { fetchStrategicIndicators } from '../../services/StrategicIndicatorsService';

const ImportData = ({ onNext, onBack, onRefreshStatus, onCompleted }) => {
    // Tracks which steps are done: metrics, factors, indicators
    const [metricsDone, setMetricsDone] = useState(false);
    const [factorsDone, setFactorsDone] = useState(false);
    const [indicatorsDone, setIndicatorsDone] = useState(false);

    const [loading, setLoading] = useState(null); // 'metrics', 'factors', 'indicators', or null
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => setLogs(prev => [...prev, msg]);

    useEffect(() => {
        if (metricsDone && factorsDone && indicatorsDone) {
            if (onCompleted) onCompleted();
        }
    }, [metricsDone, factorsDone, indicatorsDone, onCompleted]);

    const handleImportMetrics = async () => {
        setLoading('metrics');
        addLog("Importing Metrics...");
        try {
            await importMetrics();
            addLog("✅ Metrics Imported Successfully.");
            setMetricsDone(true);
            if (onRefreshStatus) onRefreshStatus();
        } catch (error) {
            addLog(`❌ Error importing Metrics: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    const handleImportFactors = async () => {
        setLoading('factors');
        addLog("Importing Quality Factors...");
        try {
            await importQualityFactors();
            addLog("✅ Quality Factors Imported Successfully.");
            setFactorsDone(true);
            if (onRefreshStatus) onRefreshStatus();
        } catch (error) {
            addLog(`❌ Error importing Quality Factors: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    const handleFetchIndicators = async () => {
        setLoading('indicators');
        addLog("Fetching Strategic Indicators...");
        try {
            await fetchStrategicIndicators();
            addLog("✅ Strategic Indicators Fetched Successfully.");
            setIndicatorsDone(true);
            if (onRefreshStatus) onRefreshStatus();
        } catch (error) {
            addLog(`❌ Error fetching Strategic Indicators: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="wizard-step import-data-step">
            <h3>Step 2: Import Data</h3>
            <p>Click each button in order to import Metrics, Quality Factors, and Strategic Indicators.</p>

            <div className="import-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <button
                    className="custom-button"
                    onClick={handleImportMetrics}
                    disabled={loading !== null}
                    style={{ backgroundColor: metricsDone ? '#28a745' : undefined }}
                >
                    {loading === 'metrics' ? 'Importing...' : metricsDone ? '✅ Metrics Done' : 'Import Metrics'}
                </button>

                <button
                    className="custom-button"
                    onClick={handleImportFactors}
                    disabled={loading !== null}
                    style={{ backgroundColor: factorsDone ? '#28a745' : undefined }}
                >
                    {loading === 'factors' ? 'Importing...' : factorsDone ? '✅ Factors Done' : 'Import Factors'}
                </button>

                <button
                    className="custom-button"
                    onClick={handleFetchIndicators}
                    disabled={loading !== null}
                    style={{ backgroundColor: indicatorsDone ? '#28a745' : undefined }}
                >
                    {loading === 'indicators' ? 'Fetching...' : indicatorsDone ? '✅ Indicators Done' : 'Fetch Indicators'}
                </button>
            </div>

            <div className="import-logs" style={{ marginTop: '2rem', padding: '1rem', borderRadius: '4px', height: '200px', overflowY: 'auto' }}>
                {logs.length === 0 && <div style={{ color: '#888' }}>Logs will appear here...</div>}
                {logs.map((log, idx) => (
                    <div key={idx} className="log-entry">{log}</div>
                ))}
            </div>

            <div className="wizard-controls" style={{ marginTop: '2rem' }}>
                <button className="custom-button secondary" onClick={onBack} disabled={loading !== null}>Back</button>
                {metricsDone && factorsDone && indicatorsDone && (
                    <button className="custom-button" onClick={onNext}>Next Step</button>
                )}
            </div>
        </div>
    );
};

export default ImportData;
