import React, { useState, useRef } from "react";
import {
  triggerProjectRecovery,
  triggerGithubRecovery,
  triggerTaigaRecovery,
  getRecoveryStatus,
} from "../../../services/ProjectService";

const STATUS_COLOR = {
  pending: "#888",
  running: "#4dabf7",
  done: "#51cf66",
  error: "#ff6b6b",
};

const STATUS_LABEL = {
  pending: "Pending",
  running: "Running...",
  done: "Done",
  error: "Error",
};

function BulkRecovery({ projects }) {
  const [selected, setSelected] = useState(new Set());
  const [recoveryType, setRecoveryType] = useState("both");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState({});
  const checkboxRefs = useRef({});

  const grouped = {};
  projects.forEach((p) => {
    const subj = p.subject || "No Subject";
    if (!grouped[subj]) grouped[subj] = [];
    grouped[subj].push(p);
  });

  const toggleProject = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSubject = (subjectProjects) => {
    const ids = subjectProjects.map((p) => p.id);
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      allSelected ? ids.forEach((id) => next.delete(id)) : ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const updateResult = (projectId, update) => {
    setResults((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), ...update },
    }));
  };

  const inferCurrentStep = (completedSteps, type) => {
    const sources = type === "github" ? ["github"] : type === "taiga" ? ["taiga"] : ["github", "taiga"];
    const completedSources = new Set(completedSteps.map((s) => s.source));
    return sources.find((s) => !completedSources.has(s)) || null;
  };

  const pollUntilDone = async (projectId, jobId, type) => {
    while (true) {
      await new Promise((r) => setTimeout(r, 3000));
      const status = await getRecoveryStatus(projectId, jobId);
      const currentStep = inferCurrentStep(status.steps || [], type);
      updateResult(projectId, {
        steps: status.steps || [],
        currentStep,
      });
      if (status.status === "done" || status.status === "error") return status;
    }
  };

  const runRecovery = async () => {
    if (selected.size === 0) return;
    setRunning(true);

    const initial = {};
    selected.forEach((id) => { initial[id] = { status: "pending", steps: [], message: "" }; });
    setResults(initial);

    const selectedProjects = projects.filter((p) => selected.has(p.id));

    for (const project of selectedProjects) {
      const firstStep = recoveryType === "taiga" ? "taiga" : "github";
      updateResult(project.id, { status: "running", currentStep: firstStep, steps: [] });
      try {
        let response;
        if (recoveryType === "github") response = await triggerGithubRecovery(project.id);
        else if (recoveryType === "taiga") response = await triggerTaigaRecovery(project.id);
        else response = await triggerProjectRecovery(project.id);

        const finalStatus = await pollUntilDone(project.id, response.job_id, recoveryType);
        const hasError = (finalStatus.steps || []).some((s) => s.status === "error");
        updateResult(project.id, {
          status: hasError ? "error" : "done",
          steps: finalStatus.steps || [],
        });
      } catch (err) {
        updateResult(project.id, {
          status: "error",
          message: err.response?.data?.error || err.message || "Unknown error",
        });
      }
    }

    setRunning(false);
  };

  const completedCount = Object.values(results).filter(
    (r) => r.status === "done" || r.status === "error"
  ).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          marginBottom: "2rem",
          padding: "1rem 1.25rem",
          background: "#23272f",
          borderRadius: "10px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: "#aaa", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
          Recovery type:
        </span>
        {["github", "taiga", "both"].map((type) => (
          <label
            key={type}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: running ? "default" : "pointer",
              color: recoveryType === type ? "#4dabf7" : "#ccc",
              fontWeight: recoveryType === type ? 600 : 400,
            }}
          >
            <input
              type="radio"
              name="recoveryType"
              value={type}
              checked={recoveryType === type}
              onChange={() => setRecoveryType(type)}
              disabled={running}
            />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </label>
        ))}

        <button
          className="custom-button"
          onClick={runRecovery}
          disabled={selected.size === 0 || running}
          style={{
            marginLeft: "auto",
            padding: "0.6rem 1.5rem",
            opacity: selected.size === 0 || running ? 0.6 : 1,
          }}
        >
          {running
            ? `Running... (${completedCount}/${selected.size})`
            : `Run Recovery (${selected.size} team${selected.size !== 1 ? "s" : ""})`}
        </button>
      </div>

      {Object.keys(grouped).map((subject) => {
        const subjectProjects = grouped[subject];
        const selectedInSubject = subjectProjects.filter((p) => selected.has(p.id)).length;
        const allSelected = selectedInSubject === subjectProjects.length;
        const someSelected = selectedInSubject > 0 && !allSelected;

        return (
          <div key={subject} style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                borderBottom: "1px solid #444",
                paddingBottom: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    el.indeterminate = someSelected;
                    checkboxRefs.current[subject] = el;
                  }
                }}
                onChange={() => toggleSubject(subjectProjects)}
                disabled={running}
                style={{ width: "16px", height: "16px", cursor: running ? "default" : "pointer" }}
              />
              <h4 style={{ margin: 0, color: "#61dafb" }}>{subject}</h4>
              <span style={{ fontSize: "0.8rem", color: "#888" }}>
                ({selectedInSubject}/{subjectProjects.length} selected)
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {subjectProjects.map((project) => {
                const result = results[project.id];
                const isSelected = selected.has(project.id);
                const borderColor = result ? STATUS_COLOR[result.status] + "66" : "#333";

                return (
                  <div
                    key={project.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.65rem 1rem",
                      background: "#1a1d23",
                      borderRadius: "8px",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProject(project.id)}
                      disabled={running}
                      style={{ width: "16px", height: "16px", cursor: running ? "default" : "pointer" }}
                    />
                    <span style={{ flex: 1, fontWeight: 500 }}>{project.name}</span>

                    {result && (
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span
                          style={{
                            color: STATUS_COLOR[result.status],
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            minWidth: "80px",
                          }}
                        >
                          {result.status === "running" && result.currentStep
                            ? `Running ${result.currentStep}...`
                            : STATUS_LABEL[result.status]}
                        </span>

                        {result.steps && result.steps.length > 0 && (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            {result.steps.map((s, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: "0.78rem",
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: "4px",
                                  background: s.status === "ok" ? "#51cf6622" : "#ff6b6b22",
                                  color: s.status === "ok" ? "#51cf66" : "#ff6b6b",
                                  border: `1px solid ${s.status === "ok" ? "#51cf6644" : "#ff6b6b44"}`,
                                }}
                              >
                                {s.source}: {s.status === "ok" ? "ok" : s.error || "error"}
                              </span>
                            ))}
                          </div>
                        )}

                        {result.message && (
                          <span style={{ fontSize: "0.78rem", color: "#ff6b6b" }}>
                            {result.message}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(grouped).length === 0 && (
        <div style={{ textAlign: "center", color: "#666", padding: "2rem" }}>
          No teams found.
        </div>
      )}
    </div>
  );
}

export default BulkRecovery;
