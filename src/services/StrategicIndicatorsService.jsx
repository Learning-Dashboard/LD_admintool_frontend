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
