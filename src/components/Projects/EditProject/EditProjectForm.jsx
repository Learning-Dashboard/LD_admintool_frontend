import React, { useState } from "react";
import { modificarProjecte } from "../../../services/ProjectService";
import "../../../styles.css";
import FeedbackMessage from "../../../utils/FeedbackMessage";

function EditProjectForm({ project, onDone, onBack }) {
  const [edited, setEdited] = useState({ ...project });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (field, value) => {
    setEdited(prev => ({ ...prev, [field]: value }));
  };

  const handleProjectIdentityChange = (source, value) => {
    const identities = { ...edited.identities };
    identities[source] = {
      ...identities[source],
      url: value
    };
    setEdited(prev => ({ ...prev, identities }));
  };

  const handleStudentChange = (idx, field, value) => {
    const students = [...edited.students];
    students[idx] = { ...students[idx], [field]: value };
    setEdited(prev => ({ ...prev, students }));
  };

  const handleIdentityChange = (idx, source, value) => {
    const students = [...edited.students];
    const student = { ...students[idx] };
    student.identities[source] = { ...student.identities[source], username: value };
    students[idx] = student;
    setEdited(prev => ({ ...prev, students }));
  };

  const handleSave = async () => {
  setSaving(true);
  try {
    await modificarProjecte(edited);
    setMessage({ type: "success", text: "Project modified successfully!" });
  } catch {
    setMessage({ type: "error", text: "Error modifying project!" });
  }
  setSaving(false);
};


  return (
    <div style={{ textAlign: "center" }}>
      {message && <FeedbackMessage message={message} onClose={() => setMessage(null)} />}
      <h3>Edit Project: {project.name}</h3>
      <div style={{ margin: "1em auto", maxWidth: 400 }}>
        <div style={{ marginBottom: "1em" }}>
          <label style={{ marginRight: "1em" }}>Project Name:</label>
          <input
            value={edited.name}
            onChange={e => handleChange('name', e.target.value)}
            disabled={saving}
            style={{ minWidth: "380px" }}
          />
        </div>
        <div style={{ marginBottom: "1em" }}>
          <label style={{ marginRight: "1em" }}>GitHub URL:</label>
          <input
            value={edited.identities?.GITHUB?.url || ""}
            onChange={e => handleProjectIdentityChange("GITHUB", e.target.value)}
            disabled={saving}
            style={{ minWidth: "380px" }}
          />
        </div>
        <div style={{ marginBottom: "2em" }}>
          <label style={{ marginRight: "1em" }}>Taiga URL:</label>
          <input
            value={edited.identities?.TAIGA?.url || ""}
            onChange={e => handleProjectIdentityChange("TAIGA", e.target.value)}
            disabled={saving}
            style={{ minWidth: "380px" }}
          />
        </div>
      </div>
      <h4>Students</h4>
      <div style={{ display: "flex", justifyContent: "center", gap: "1em", fontWeight: "bold", marginBottom: "0.8em" }}>
        <span style={{ flex: 1 }}>Name</span>
        <span style={{ flex: 1 }}>Github</span>
        <span style={{ flex: 1 }}>Taiga</span>
      </div>
      {edited.students && edited.students.length > 0 ? (
        edited.students.map((s, idx) => (
          <div key={s.id} style={{ display: "flex", justifyContent: "center", gap: "1em", marginBottom: "0.7em" }}>
            <input
              value={s.name}
              onChange={e => handleStudentChange(idx, 'name', e.target.value)}
              disabled={saving}
              style={{ flex: 1 }}
              placeholder="Nom"
            />
            <input
              value={s.identities?.GITHUB?.username || ""}
              onChange={e => handleIdentityChange(idx, "GITHUB", e.target.value)}
              disabled={saving}
              style={{ flex: 1 }}
              placeholder="Github"
            />
            <input
              value={s.identities?.TAIGA?.username || ""}
              onChange={e => handleIdentityChange(idx, "TAIGA", e.target.value)}
              disabled={saving}
              style={{ flex: 1 }}
              placeholder="Taiga"
            />
          </div>
        ))
      ) : (
        <div>No students available</div>
      )}
      <div style={{ marginTop: "2em" }}>
        <button className="custom-button" onClick={handleSave} disabled={saving}>Save</button>
        <button className="custom-button" onClick={onDone} disabled={saving} style={{ marginLeft: "1em" }}>Cancel</button>
      </div>
      <button className="back-button" onClick={onBack}>Back</button>
    </div>
  );
}

export default EditProjectForm;
