import axios from "axios";


//GET metrics by project
export async function getMetricsByProject(projectExternalId) {
  return axios.get("/api/metrics", {
    params: { prj: projectExternalId }
  });
}

//GET metrics categories list
export async function getMetricsCategoriesList() {
  return axios.get("/api/metrics/list");
}

//GET all metrics categories
export async function getAllMetricsCategories() {
  return axios.get("/api/metrics/categories");
}

//PUT edit metric
export async function editMetric(id, { threshold, url, categoryName }, project) {
  const formData = new FormData();
  formData.append("threshold", threshold ?? "");
  formData.append("url", url ?? "");
  formData.append("categoryName", categoryName ?? "");

  return axios.put(
    `/api/metrics/${id}?prj=${encodeURIComponent(project)}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
}

// POST import metrics
export async function importMetrics() {
  return axios.get("/api/metrics/import");
}
