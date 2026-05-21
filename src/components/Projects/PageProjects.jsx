import React, { useState, useEffect } from "react";
import EditProject from "./EditProject/EditProject";
import { llistarProjectes, esborrarProjecte } from "../../services/ProjectService";
import "../../styles.css";

function PageProjects() {
  const [mode, setMode] = useState(null); // 'edit' or 'delete'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await llistarProjectes();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Are you sure you want to delete project "${project.name}"? This will delete all associated data.`)) return;

    try {
      await esborrarProjecte(project.id);
      alert("Project deleted successfully");
      fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Error deleting project");
    }
  };

  const groupProjectsBySubject = () => {
    const mapping = {};
    projects.forEach(p => {
      const subj = p.subject || "No Subject";
      if (!mapping[subj]) mapping[subj] = [];
      mapping[subj].push(p);
    });
    return mapping;
  };

  if (selectedProjectId && mode === 'edit') {
    const project = projects.find(p => p.id === selectedProjectId);
    return (
      <EditProject
        initialProject={project}
        onBack={() => setSelectedProjectId(null)}
        onUpdate={fetchProjects}
      />
    );
  }

  const grouped = groupProjectsBySubject();

  return (
    <div className="page-container">
      <div className="management-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3>Project Management</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button
            className={`custom-button ${mode === 'edit' ? 'active' : ''}`}
            onClick={() => setMode('edit')}
            style={{
              backgroundColor: mode === 'edit' ? '#007bff' : '#23272f',
              border: mode === 'edit' ? '2px solid #fff' : 'none'
            }}
          >
            ✏️ Edit Teams
          </button>
          <button
            className={`custom-button ${mode === 'delete' ? 'active' : ''}`}
            onClick={() => setMode('delete')}
            style={{
              backgroundColor: mode === 'delete' ? '#dc3545' : '#23272f',
              border: mode === 'delete' ? '2px solid #fff' : 'none'
            }}
          >
            🗑️ Delete Teams
          </button>
        </div>
      </div>

      {mode && !loading && (
        <div className="subjects-grid">
          {Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center' }}>No teams found.</div>
          ) : (
            Object.keys(grouped).map(subject => (
              <div key={subject} className="subject-section" style={{ marginBottom: '3rem' }}>
                <h4 style={{ borderBottom: '1px solid #444', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#61dafb' }}>
                  {subject}
                </h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {grouped[subject].map(project => (
                    <div
                      key={project.id}
                      className={`project-card ${mode === 'delete' ? 'danger' : ''}`}
                      onClick={() => {
                        if (mode === 'edit') setSelectedProjectId(project.id);
                        if (mode === 'delete') handleDeleteProject(project);
                      }}
                      style={{
                        background: '#23272f',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        minWidth: '200px',
                        cursor: mode === 'edit' ? 'pointer' : 'default',
                        position: 'relative',
                        transition: 'transform 0.2s',
                        border: '1px solid #333'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{project.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.5rem' }}>
                        Students: {project.students.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PageProjects;
