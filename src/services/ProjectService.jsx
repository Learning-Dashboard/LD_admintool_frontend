import axios from "axios";


//GET all projects
export async function llistarProjectes() {
  const resposta = await axios.get("/api/projects");
  return resposta.data;
}

//GET by ID
export async function obtenirProjectePerId(id) {
  const resposta = await axios.get(`/api/projects/${id}`);
  return resposta.data;
}

//POST
export async function importarProjectes(dadesProjectes) {
  return axios.post("/api/projects", dadesProjectes, {
    headers: { "Content-Type": "application/json" },
  });
}

//PUT
export async function modificarProjecte(projecte) {
  const resposta = await axios.put(`/api/projects/${projecte.id}`, projecte, {
    headers: { "Content-Type": "application/json" }
  });
  return resposta.data;
}

//DELETE
export async function esborrarProjecte(id) {
  return axios.delete(`/api/projects/${id}`);
}

export async function syncProjectCategories() {
  return axios.post("/api/projects/sync-categories");
}

//POST - Validate new student
export async function validarNouEstudiant(data) {
  const resposta = await axios.post("/api/projects/validate-student", data, {
    headers: { "Content-Type": "application/json" }
  });
  return resposta.data;
}

export async function triggerProjectRecovery(projectId, payload = null) {
  const resposta = payload
    ? await axios.post(`/api/projects/${projectId}/recover`, payload)
    : await axios.post(`/api/projects/${projectId}/recover`);
  return resposta.data;
}

export async function triggerGithubRecovery(projectId, payload = null) {
  const resposta = payload
    ? await axios.post(`/api/projects/${projectId}/recover/github`, payload)
    : await axios.post(`/api/projects/${projectId}/recover/github`);
  return resposta.data;
}

export async function triggerTaigaRecovery(projectId, payload = null) {
  const resposta = payload
    ? await axios.post(`/api/projects/${projectId}/recover/taiga`, payload)
    : await axios.post(`/api/projects/${projectId}/recover/taiga`);
  return resposta.data;
}