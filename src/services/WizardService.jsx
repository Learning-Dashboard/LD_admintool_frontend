import axios from 'axios';

export async function getWizardStatus() {
    try {
        const response = await axios.get("/api/wizard/status");
        return response.data;
    } catch (error) {
        console.error("Error fetching wizard status:", error);
        return {
            hasProjects: false,
            hasData: false,
            hasMetricsCategories: false,
            hasFactorsCategories: false,
            hasStrategicIndicatorCategories: false
        };
    }
}
