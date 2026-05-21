import React, { useState } from "react";
import { modificarProjecte, triggerProjectRecovery, triggerGithubRecovery, triggerTaigaRecovery, validarNouEstudiant } from "../../../services/ProjectService";
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
  const [recoveryTokens, setRecoveryTokens] = useState({
    githubToken: "",
    taigaToken: ""
  });
  const [validating, setValidating] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoveringGithub, setRecoveringGithub] = useState(false);
  const [recoveringTaiga, setRecoveringTaiga] = useState(false);

  const handleRemoveStudent = (idx) => {
    setEdited(prev => {
      const students = [...prev.students];
      students[idx] = { ...students[idx], markedForDeletion: true };
      return { ...prev, students };
    });
  };

  const handleUndoDelete = (idx) => {
    setEdited(prev => {
      const students = [...prev.students];
      students[idx] = { ...students[idx], markedForDeletion: false };
      return { ...prev, students };
    });
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
  const studentsToSend = (edited.students || []).filter(s => !s.markedForDeletion);
      setMessage({ type: "info", text: "Running Save & Sync workflow..." });

      const response = await modificarProjecte({ ...edited, students: studentsToSend });

      if (response?.success) {
        setMessage({ type: "success", text: "Team updated and synchronized successfully!" });
        setTimeout(onDone, 1500);
      } else {
        const failureMessage = response?.steps?.find(step => step.status === "FAILED")?.error
          || "Save & Sync completed with issues.";
        setMessage({ type: "error", text: failureMessage });
      }
    } catch (error) {
      console.error(error);
      const responseData = error.response?.data;
      const failureMessage = responseData?.steps?.find(step => step.status === "FAILED")?.error
        || responseData?.message
        || error.response?.data
        || error.message
        || "Error saving changes or updating data!";
      setMessage({ type: "error", text: failureMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleRecovery = async () => {
    setRecovering(true);
    setMessage({ type: "info", text: "Running GitHub/Taiga recovery..." });

    try {
      const payload = {};
      if (recoveryTokens.githubToken?.trim()) {
        payload.githubToken = recoveryTokens.githubToken.trim();
      }
      if (recoveryTokens.taigaToken?.trim()) {
        payload.taigaToken = recoveryTokens.taigaToken.trim();
      }

      const response = Object.keys(payload).length > 0
        ? await triggerProjectRecovery(project.id, payload)
        : await triggerProjectRecovery(project.id);
      const steps = response?.recovery?.steps || [];
      const failedStep = steps.find((step) => step.status === "error");

      if (failedStep) {
        setMessage({
          type: "error",
          text: `Recovery failed (${failedStep.source}): ${failedStep.error || "unknown error"}`
        });
      } else {
        setMessage({ type: "success", text: "Recovery finished successfully for GitHub and Taiga." });
      }
    } catch (error) {
      const backendError = error.response?.data?.error;
      setMessage({ type: "error", text: backendError || error.message || "Recovery failed" });
    } finally {
      setRecovering(false);
    }
  };

  const handleGithubRecovery = async () => {
    setRecoveringGithub(true);
    setMessage({ type: "info", text: "Running GitHub recovery..." });
    try {
      const payload = recoveryTokens.githubToken?.trim()
        ? { githubToken: recoveryTokens.githubToken.trim() }
        : null;
      const response = await triggerGithubRecovery(project.id, payload);
      const steps = response?.recovery?.steps || [];
      const failedStep = steps.find((step) => step.status === "error");
      if (failedStep) {
        setMessage({ type: "error", text: `GitHub recovery failed: ${failedStep.error || "unknown error"}` });
      } else {
        setMessage({ type: "success", text: "GitHub recovery finished successfully." });
      }
    } catch (error) {
      const backendError = error.response?.data?.error;
      setMessage({ type: "error", text: backendError || error.message || "GitHub recovery failed" });
    } finally {
      setRecoveringGithub(false);
    }
  };

  const handleTaigaRecovery = async () => {
    setRecoveringTaiga(true);
    setMessage({ type: "info", text: "Running Taiga recovery..." });
    try {
      const payload = recoveryTokens.taigaToken?.trim()
        ? { taigaToken: recoveryTokens.taigaToken.trim() }
        : null;
      const response = await triggerTaigaRecovery(project.id, payload);
      const steps = response?.recovery?.steps || [];
      const failedStep = steps.find((step) => step.status === "error");
      if (failedStep) {
        setMessage({ type: "error", text: `Taiga recovery failed: ${failedStep.error || "unknown error"}` });
      } else {
        setMessage({ type: "success", text: "Taiga recovery finished successfully." });
      }
    } catch (error) {
      const backendError = error.response?.data?.error;
      setMessage({ type: "error", text: backendError || error.message || "Taiga recovery failed" });
    } finally {
      setRecoveringTaiga(false);
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

          <label style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.8rem' }}>
            GitHub Token for Recovery (optional override)
          </label>
          <input
            type="password"
            value={recoveryTokens.githubToken}
            onChange={(e) => setRecoveryTokens({ ...recoveryTokens, githubToken: e.target.value })}
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

          <label style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.8rem' }}>
            Taiga Token for Recovery (optional override)
          </label>
          <input
            type="password"
            value={recoveryTokens.taigaToken}
            onChange={(e) => setRecoveryTokens({ ...recoveryTokens, taigaToken: e.target.value })}
            placeholder="taiga_xxxxxxxxxxxx"
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
                  fontSize: '0.9rem',
                  opacity: s.markedForDeletion ? 0.4 : 1,
                  textDecoration: s.markedForDeletion ? 'line-through' : 'none',
                  background: s.markedForDeletion ? '#3a3a3a' : 'transparent'
                }}>
                  <span>{s.name} {s.markedForDeletion && <i style={{ fontSize: '0.8em', color: '#ff6b6b' }}>(Pending Delete)</i>}</span>
                  <span style={{ color: '#cececeff' }}>{s.identities?.GITHUB?.username || "-"}</span>
                  <span style={{ color: '#cececeff' }}>{s.identities?.TAIGA?.username || "-"}</span>
                  <div style={{ textAlign: 'center' }}>
                    {s.markedForDeletion ? (
                      <button
                        onClick={() => handleUndoDelete(idx)}
                        disabled={saving}
                        style={{
                          width: "80px",
                          padding: "0.3rem",
                          backgroundColor: "#f0ad4e",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer"
                        }}
                      >
                        Undo
                      </button>
                    ) : (
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
                    )}
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
          {validating ? "Verifying Membership..." : "Validate student"}
        </button>
      </section>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '3rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="custom-button"
            onClick={handleGithubRecovery}
            disabled={saving || recovering || recoveringGithub || recoveringTaiga}
            style={{ flex: 1, padding: '1rem', marginLeft: 0 }}
          >
            {recoveringGithub ? "Running..." : "Run GitHub Recovery"}
          </button>
          <button
            className="custom-button"
            onClick={handleTaigaRecovery}
            disabled={saving || recovering || recoveringGithub || recoveringTaiga}
            style={{ flex: 1, padding: '1rem', marginLeft: 0 }}
          >
            {recoveringTaiga ? "Running..." : "Run Taiga Recovery"}
          </button>
          <button
            className="custom-button"
            onClick={handleRecovery}
            disabled={saving || recovering || recoveringGithub || recoveringTaiga}
            style={{ flex: 1, padding: '1rem', marginLeft: 0 }}
          >
            {recovering ? "Running Recovery..." : "Run GitHub/Taiga Recovery"}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="custom-button success"
            onClick={handleSave}
            disabled={saving || recovering || recoveringGithub || recoveringTaiga}
            style={{ flex: 2, padding: '1rem', fontSize: '1rem', marginLeft: 0 }}
          >
            {saving ? "Saving Changes..." : "Save & Synchronize team"}
          </button>
          <button
            className="custom-button"
            onClick={onDone}
            disabled={saving || recovering || recoveringGithub || recoveringTaiga}
            style={{ flex: 1, padding: '1rem' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProjectForm;
