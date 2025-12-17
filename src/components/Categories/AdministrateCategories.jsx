import React, { useEffect, useState } from "react";
import ManageSubjectCategories from "./ManageSubjectCategories";
import { llistarProjectes } from "../../services/ProjectService";
import '../../styles.css';

function AdministrateCategories({ onBack }) {
  const [mapping, setMapping] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projects = await llistarProjectes();

      const newMapping = {};
      if (projects) {
        projects.forEach(p => {
          const subj = p.subject;
          if (subj) {
            if (!newMapping[subj]) newMapping[subj] = [];
            newMapping[subj].push(p);
          }
        });
      }
      setMapping(newMapping);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading projects...</div>;
  }

  if (!selectedSubject) {
    return (
      <div>
        <h3>Manage Categories</h3>
        <p style={{ textAlign: "center", margin: "2em" }}>Select subject to manage its categories:</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "2em", flexWrap: "wrap" }}>
          {Object.keys(mapping).length === 0 ? (
            <div style={{ color: "#aaa" }}>No projects with subjects found.</div>
          ) : (
            Object.keys(mapping).map(subject => (
              <div
                key={subject}
                style={{
                  background: "#23272f", color: "#fff", borderRadius: "12px",
                  padding: "2em 2em", minWidth: "220px", cursor: "pointer"
                }}
                onClick={() => setSelectedSubject(subject)}
              >
                <div style={{ fontWeight: 700, fontSize: "1.2em", marginBottom: "0.8em" }}>
                  {subject}
                </div>
                <div>
                  Teams: <b>{mapping[subject]?.length ?? 0}</b>
                </div>
              </div>
            ))
          )}
        </div>
        <button className="back-button" onClick={onBack}>Back</button>
      </div>
    );
  }


  return (
    <ManageSubjectCategories
      subject={selectedSubject}
      onBack={() => setSelectedSubject(null)}
    />
  );
}

export default AdministrateCategories;
