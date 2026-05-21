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