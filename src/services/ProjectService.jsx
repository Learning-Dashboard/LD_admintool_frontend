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
  return axios.put(`/api/projects/${projecte.id}`, projecte, {
    headers: { "Content-Type": "application/json" }
  });
}

//DELETE
export async function esborrarProjecte(id) {
  return axios.delete(`/api/projects/${id}`);
}