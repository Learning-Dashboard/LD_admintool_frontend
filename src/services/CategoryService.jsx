import axios from "axios";

//////////////////////////////////////////////////////////////////// METRICS ///////////////////////////////////////////////////////////////////////
//POST
export async function importarCategoriesMetriques(categories) {
  // categories: array agrupat del JSON
  return axios.post("/api/categories/metrics", categories, {
    headers: { "Content-Type": "application/json" }
  });
}

//////////////////////////////////////////////////////////////////// FACTORS ///////////////////////////////////////////////////////////////////////
//POST
export async function importarCategoriesFactors(categories) {
  // categories: array agrupat del JSON
  return axios.post("/api/categories/factors", categories, {
    headers: { "Content-Type": "application/json" }
  });
}

///////////////////////////////////////////////////////// STRATEGIC INDICATORS /////////////////////////////////////////////////////////////////////
//POST
export async function importarCategoriesStrategicIndicators(interval) {
  return axios.post("/api/categories/strategicIndicators", interval, {
    headers: { "Content-Type": "application/json" }
  });
}

//GET all metrics categories
export async function getAllMetricsCategories() {
  return axios.get("/api/metrics/categories");
}

//GET all factors categories
export async function getAllFactorsCategories() {
  return axios.get("/api/factors/categories");
}

//GET all strategic indicators categories
export async function getAllStrategicIndicatorCategories() {
  return axios.get("/api/strategicIndicators/categories");
}
