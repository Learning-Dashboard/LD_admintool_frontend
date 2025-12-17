import axios from "axios";


//GET factors by project
export async function getFactorsByProject(projectExternalId) {
  return axios.get("/api/factors", {
    params: { prj: projectExternalId }
  });
}

//GET factors categories list
export async function getFactorsCategoriesList() {
  return axios.get("/api/factors/list");
}

//GET all factors categories
export async function getAllFactorsCategories() {
  return axios.get("/api/factors/categories");
}

//PUT edit factor category
export async function editFactorCategory(id, category, project) {
  const formData = new FormData();
  formData.append("category", category ?? "");

  return axios.put(
    `/api/factors/${id}/category?prj=${encodeURIComponent(project)}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
}
