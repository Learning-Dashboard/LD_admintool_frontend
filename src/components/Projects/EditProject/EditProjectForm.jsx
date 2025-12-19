import React, { useState } from "react";
import { modificarProjecte, validarNouEstudiant } from "../../../services/ProjectService";
import { importMetrics } from "../../../services/MetricsService";
import { importQualityFactors } from "../../../services/FactorsService";
import { fetchStrategicIndicators } from "../../../services/StrategicIndicatorsService";
import "../../../styles.css";
import FeedbackMessage from "../../../utils/FeedbackMessage";

function EditProjectForm({ project, onDone, onBack }) {
  const [edited, setEdited] = useState({
    ...project,
    githubToken: project.githubToken || ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [newStudent, setNewStudent] = useState({
    name: "",
    githubUsername: "",
    taigaUsername: ""
  });
  const [validating, setValidating] = useState(false);

  const handleRemoveStudent = (idx) => {
    const students = [...edited.students];
    students.splice(idx, 1);
    setEdited(prev => ({ ...prev, students }));
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.githubUsername || !newStudent.taigaUsername) {
      setMessage({
        type: "error", text: "Please fill all the fields"
      });
      return;
    }

    if (!edited.githubToken) {
      setMessage({ type: "error", text: "A GitHub token is required to verify student membership." });
      return;
    }

    setValidating(true);
    try {
      const validationResult = await validarNouEstudiant({
        projectId: project.id,
        githubUrl: edited.identities?.GITHUB?.url,
        taigaUrl: edited.identities?.TAIGA?.url,
        githubToken: edited.githubToken,
        student: {
          name: newStudent.name,
          identities: {
            GITHUB: { username: newStudent.githubUsername },
            TAIGA: { username: newStudent.taigaUsername }
          }
        }
      });

      if (validationResult.valid) {
        const students = [...(edited.students || []), {
          id: null, // New student
          name: newStudent.name,
          identities: {
            GITHUB: { 
              dataSource: "GITHUB",
              username: newStudent.githubUsername 
            },
            TAIGA: { 
              dataSource: "TAIGA",
              username: newStudent.taigaUsername 
            }
          }
        }];
        setEdited(prev => ({ ...prev, students }));
        setNewStudent({ name: "", githubUsername: "", taigaUsername: "" });
        setMessage({ type: "success", text: "Student validated and added to the list!" });
      } else {
        const errorMessages = validationResult.errors.join(", ");
        setMessage({ type: "error", text: `Validation failed: ${errorMessages}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Validation error: " + error.message });
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await modificarProjecte(edited);
      setMessage({ type: "info", text: "Changes saved. Updating dashboard data..." });

      // Sequential updates
      await importMetrics();
      await importQualityFactors();
      await fetchStrategicIndicators();

      setMessage({ type: "success", text: "Team updated and data refreshed successfully!" });
      setTimeout(onDone, 1500);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Error saving changes or updating data!" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-project-form glass-effect" style={{ boxSizing: 'border-box', margin: '0 auto', padding: '2rem', background: '#1a1d23', borderRadius: '16px', border: '1px solid #333' }}>
      {message && <FeedbackMessage message={message} onClose={() => setMessage(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0, color: '#4dabf7' }}>Edit Team: {project.name}</h3>
        <button className="back-button" onClick={onBack} disabled={saving}>Back</button>
      </div>

      <section style={{ marginBottom: '2rem', padding: '1.5rem', background: '#23272f', borderRadius: '12px' }}>
        <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>Configuration</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#aaa' }}>GitHub Personal Access Token (Required for verification)</label>
          <input
            type="password"
            value={edited.githubToken}
            onChange={(e) => setEdited({ ...edited, githubToken: e.target.value })}
            placeholder="ghp_xxxxxxxxxxxx"
            style={{
              padding: '0.8rem',
              background: '#0d1117',
              border: '1px solid #444',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>Current Students</h4>
        <div style={{ background: '#23272f', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr', padding: '1rem', background: '#2d333b', fontWeight: 600, fontSize: '0.9rem' }}>
            <span>Name</span>
            <span>GitHub</span>
            <span>Taiga</span>
            <span style={{ textAlign: 'center' }}>Action</span>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {edited.students && edited.students.length > 0 ? (
              edited.students.map((s, idx) => (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 2fr 1fr',
                  padding: '1rem',
                  borderTop: '1px solid #333',
                  alignItems: 'center',
                  fontSize: '0.9rem'
                }}>
                  <span>{s.name}</span>
                  <span style={{ color: '#cececeff' }}>{s.identities?.GITHUB?.username || "-"}</span>
                  <span style={{ color: '#cececeff' }}>{s.identities?.TAIGA?.username || "-"}</span>
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleRemoveStudent(idx)}
                      disabled={saving}
                      style={{
                        width: "80px",
                        padding: "0.3rem",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No students in this team yet.</div>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: '1.5rem', background: '#23272f', borderRadius: '12px', border: '1px dashed #444' }}>
        <h4 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem' }}>Add New Student</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>Full Name</label>
            <input
              value={newStudent.name}
              onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="custom-input"
              style={{ background: '#0d1117', padding: '0.6rem' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>GitHub User</label>
            <input
              value={newStudent.githubUsername}
              onChange={e => setNewStudent({ ...newStudent, githubUsername: e.target.value })}
              placeholder="username"
              className="custom-input"
              style={{ background: '#0d1117', padding: '0.6rem' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>Taiga User</label>
            <input
              value={newStudent.taigaUsername}
              onChange={e => setNewStudent({ ...newStudent, taigaUsername: e.target.value })}
              placeholder="username"
              className="custom-input"
              style={{ background: '#0d1117', padding: '0.6rem' }}
            />
          </div>
        </div>
        <button
          onClick={handleAddStudent}
          disabled={validating || saving}
          className="custom-button primary"
          style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', opacity: validating ? 0.7 : 1, marginLeft: 0 }}
        >
          {validating ? "Verifying Membership..." : "Validate & Add Student"}
        </button>
      </section>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
        <button
          className="custom-button success"
          onClick={handleSave}
          disabled={saving}
          style={{ flex: 2, padding: '1rem', fontSize: '1rem', marginLeft: 0 }}
        >
          {saving ? "Saving Changes..." : "Save and Sync Team"}
        </button>
        <button
          className="custom-button"
          onClick={onDone}
          disabled={saving}
          style={{ flex: 1, padding: '1rem' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditProjectForm;
