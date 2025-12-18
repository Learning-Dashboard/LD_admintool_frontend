import axios from "axios";


//GET strategic indicators by project
export async function getStrategicIndicatorsByProject(projectExternalId) {
  return axios.get("/api/strategicIndicators", {
    params: { prj: projectExternalId }
  });
}


//GET strategic indicators categories list
export async function getStrategicIndicatorsCategoriesList() {
  return axios.get("/api/strategicIndicators/list");
}

//GET all strategic indicators categories
export async function getAllStrategicIndicatorCategories() {
  return axios.get("/api/strategicIndicators/categories");
}

//PUT edit strategic indicator
export async function editStrategicIndicator(id, { threshold, url, categoryName }, project) {
  const formData = new FormData();
  formData.append("threshold", threshold ?? "");
  formData.append("url", url ?? "");
  formData.append("categoryName", categoryName ?? "");

  return axios.put(
    `/api/strategicIndicators/${id}?prj=${encodeURIComponent(project)}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
}

// GET fetch strategic indicators
export async function fetchStrategicIndicators() {
  return axios.get("/api/strategicIndicators/fetch");
}
