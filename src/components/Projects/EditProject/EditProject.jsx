import React, { useState, useEffect } from "react";
import EditProjectForm from "./EditProjectForm";
import { llistarProjectes, obtenirProjectePerId } from "../../../services/ProjectService";
import '../../../styles.css';

function EditProject({ onBack }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    llistarProjectes()
      .then(data => setProjects(data))
      .catch(() => setError("Error loading projects"))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = index => {
    const id = projects[index].id;
    obtenirProjectePerId(id)
      .then(fullProject => {
        console.log("Projecte carregat:", JSON.stringify(fullProject, null, 2));
        setEditingProject(fullProject);
        setEditingIndex(index);
      })
      .catch(() => setError("Error loading project details"));
  };

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>{error} <button className="custom-button" onClick={onBack}>Back</button></div>;

  if (editingProject) {
    return (
      <EditProjectForm
        project={editingProject}
        onDone={() => {
          setEditingProject(null);
          setEditingIndex(null);
        }}
        onBack={onBack}
      />
    );
  }

  return (
    <div>
      <h3>Edit Project</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {projects.map((p, i) => (
          <li key={p.id} style={{ marginBottom: "2em" }}>
            <strong>{p.name}</strong>
            <button style={{ marginLeft: "2em" }} onClick={() => handleEdit(i)}>
              Edit
            </button>
          </li>
        ))}
      </ul>
      <button className="back-button" onClick={onBack}>Back</button>
    </div>
  );
}

export default EditProject;
