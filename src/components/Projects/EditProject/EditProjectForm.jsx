import React, { useState } from "react";
import { modificarProjecte, validarNouEstudiant } from "../../../services/ProjectService";
import { importMetrics } from "../../../services/MetricsService";
import { importQualityFactors } from "../../../services/FactorsService";
import { fetchStrategicIndicators } from "../../../services/StrategicIndicatorsService";
import "../../../styles.css";
import FeedbackMessage from "../../../utils/FeedbackMessage";

function EditProjectForm({ project, onDone, onBack }) {
  const [edited, setEdited] = useState({ ...project });
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
      setMessage({ type: "error", text: "Si us plau, omple tots els camps de l'estudiant" });
      return;
    }

    setValidating(true);
    try {
      // Validar l'estudiant amb el backend
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
        // Afegir l'estudiant
        const students = [...edited.students, {
          name: newStudent.name,
          identities: {
            GITHUB: { username: newStudent.githubUsername },
            TAIGA: { username: newStudent.taigaUsername }
          }
        }];
        setEdited(prev => ({ ...prev, students }));

        // Netejar el formulari
        setNewStudent({ name: "", githubUsername: "", taigaUsername: "" });
        setMessage({ type: "success", text: "Estudiant afegit correctament!" });
      } else {
        // Mostrar errors de validació
        const errorMessages = validationResult.errors.join(", ");
        setMessage({ type: "error", text: `No es pot afegir l'estudiant: ${errorMessages}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error validant l'estudiant: " + error.message });
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await modificarProjecte(edited);

      // Trigger sequential imports as required when team changes
      setMessage({ type: "info", text: "Projecte modificat. Actualitzant mètriques..." });
      await importMetrics();

      setMessage({ type: "info", text: "Projecte modificat. Actualitzant factors..." });
      await importQualityFactors();

      setMessage({ type: "info", text: "Projecte modificat. Actualitzant indicadors..." });
      await fetchStrategicIndicators();

      setMessage({ type: "success", text: "Projecte modificat i dades actualitzades correctament!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Error modificant el projecte o actualitzant dades!" });
    }
    setSaving(false);
  };


  return (
    <div style={{ textAlign: "center" }}>
      {message && <FeedbackMessage message={message} onClose={() => setMessage(null)} />}
      <h3>Edit Team: {project.name}</h3>

      <h4>Current Students</h4>
      <div style={{ display: "flex", justifyContent: "center", gap: "1em", fontWeight: "bold", marginBottom: "0.8em" }}>
        <span style={{ flex: 1 }}>Name</span>
        <span style={{ flex: 1 }}>Github</span>
        <span style={{ flex: 1 }}>Taiga</span>
        <span style={{ width: "80px" }}>Acció</span>
      </div>
      {edited.students && edited.students.length > 0 ? (
        edited.students.map((s, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "center", gap: "1em", marginBottom: "0.7em", alignItems: "center" }}>
            <span style={{ flex: 1 }}>{s.name}</span>
            <span style={{ flex: 1 }}>{s.identities?.GITHUB?.username || "-"}</span>
            <span style={{ flex: 1 }}>{s.identities?.TAIGA?.username || "-"}</span>
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
        ))
      ) : (
        <div>No students found</div>
      )}

      <hr style={{ margin: "2em 0" }} />

      <h4>Add new student</h4>
      <div style={{ margin: "1em auto", maxWidth: "600px" }}>
        <div style={{ display: "flex", gap: "1em", marginBottom: "1em", justifyContent: "center" }}>
          <input
            value={newStudent.name}
            onChange={e => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
            disabled={validating || saving}
            placeholder="Student Name"
            style={{ flex: 1, padding: "0.5rem" }}
          />
          <input
            value={newStudent.githubUsername}
            onChange={e => setNewStudent(prev => ({ ...prev, githubUsername: e.target.value }))}
            disabled={validating || saving}
            placeholder="GitHub Username"
            style={{ flex: 1, padding: "0.5rem" }}
          />
          <input
            value={newStudent.taigaUsername}
            onChange={e => setNewStudent(prev => ({ ...prev, taigaUsername: e.target.value }))}
            disabled={validating || saving}
            placeholder="Taiga Username"
            style={{ flex: 1, padding: "0.5rem" }}
          />
        </div>
        <button
          onClick={handleAddStudent}
          disabled={validating || saving}
          style={{
            padding: "0.6rem 2rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: validating || saving ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        >
          {validating ? "Validant..." : "Afegir Estudiant"}
        </button>
      </div>

      <hr style={{ margin: "2em 0" }} />

      <div style={{ marginTop: "2em" }}>
        <button className="custom-button" onClick={handleSave} disabled={saving}>Save changes</button>
        <button className="custom-button" onClick={onDone} disabled={saving} style={{ marginLeft: "1em" }}>Cancel</button>
      </div>
      <button className="back-button" onClick={onBack}>Back</button>
    </div>
  );
}

export default EditProjectForm;
