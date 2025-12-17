import axios from "axios";

// Step 2: Sequential Import APIs

export async function importMetrics() {
    // Assuming POST as it is an action, but could be GET. 
    // If this fails with 404 or 405, we might need to switch method.
    return axios.post("/api/metrics/import");
}

export async function importQualityFactors() {
    return axios.post("/api/qualityFactors/import");
}

export async function fetchStrategicIndicators() {
    // "fetch" usually implies GET
    return axios.get("/api/strategicIndicators/fetch");
}

// Helper to run them sequentially
export async function runSequentialDataImport(onProgress) {
    if (onProgress) onProgress("Importing Metrics...");
    await importMetrics();

    if (onProgress) onProgress("Importing Quality Factors...");
    await importQualityFactors();

    if (onProgress) onProgress("Fetching Strategic Indicators...");
    await fetchStrategicIndicators();

    if (onProgress) onProgress("Done");
}
