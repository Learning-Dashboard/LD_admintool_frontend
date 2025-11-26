import React, { useEffect, useState } from "react";
import ManageSubjectCategories from "./ManageSubjectCategories";
import '../../styles.css';

function AdministrateCategories({ onBack }) {
  const [mapping, setMapping] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('assignatura_teams_mapping');
    if (saved) setMapping(JSON.parse(saved));
  }, []);

  if (!selectedSubject) {
    return (
      <div>
        <h3>Manage Categories</h3>
        <p style={{ textAlign: "center", margin: "2em" }}>Select subject to manage its categories:</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "2em", flexWrap: "wrap" }}>
          {Object.keys(mapping).map(subject => (
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
          ))}
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
