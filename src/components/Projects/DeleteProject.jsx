import React, { useState, useEffect } from "react";
import { llistarProjectes, esborrarProjecte } from "../../services/ProjectService";
import '../../styles.css';

function DeleteProject({ onBack }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState(null);

  useEffect(() => {
    llistarProjectes()
      .then(setProjects)
      .catch(() => setError("Error loading projects"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const projectToDelete = projects.find(p => p.id === id);

      await esborrarProjecte(id);
      setDeleted(id);
      setProjects(projects.filter(p => p.id !== id));

      const mapping = JSON.parse(localStorage.getItem('subject_teams_mapping')) || {};

      Object.keys(mapping).forEach(subject => {
        mapping[subject] = mapping[subject].filter(
          teamName => teamName !== projectToDelete.name && teamName !== projectToDelete.externalId
        );
        if (mapping[subject].length === 0) delete mapping[subject];
      });

      localStorage.setItem('subject_teams_mapping', JSON.stringify(mapping));

    } catch {
      setError("Error deleting project");
    }
  };

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>{error} <button className="back-button" onClick={onBack}>Back</button></div>;

  if (!projects.length) {
    return (
      <div>
        <p>There are no projects to delete.</p>
        <button className="back-button" onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div>
      <h3>Eliminar Projecte</h3>
      <ul>
        {projects.map(p => (
          <li key={p.id} style={{ marginTop: "1em" }}>
            <strong>{p.name}</strong>
            <button
              style={{ marginLeft: "2em" }}
              onClick={() => handleDelete(p.id)}
              disabled={deleted === p.id}
            >
              Delete
            </button>
            {deleted === p.id && <span style={{ color: "green", marginLeft: "1em" }}>Deleted!</span>}
          </li>
        ))}
      </ul>
      <br />
      <button className="back-button" onClick={onBack}>Back</button>
    </div>
  );
}

export default DeleteProject;
