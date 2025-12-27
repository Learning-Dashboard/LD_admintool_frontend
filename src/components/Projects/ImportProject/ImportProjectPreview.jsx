import React, { useState, useMemo } from "react";

function ImportProjectPreview({ data, onConfirm, onCancel }) {
  const [tokens, setTokens] = useState({}); // { [subject]: token }

  if (!data || data.length === 0) return null;

  // Group teams by subject
  const groupedData = useMemo(() => {
    const groups = {};
    data.forEach(team => {
      const subject = team.subject || "Unknown Subject";
      if (!groups[subject]) groups[subject] = [];
      groups[subject].push(team);
    });
    return groups;
  }, [data]);

  const subjects = Object.keys(groupedData);

  const handleTokenChange = (subject, value) => {
    setTokens(prev => ({ ...prev, [subject]: value }));
  };

  const allTokensFilled = subjects.every(subject => tokens[subject]?.trim());

  const handleConfirmWithTokens = () => {
    const dataWithTokens = data.map(team => ({
      ...team,
      githubToken: tokens[team.subject || "Unknown Subject"]
    }));
    onConfirm(dataWithTokens);
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {subjects.map(subject => (
          <div key={subject} style={{
            width: "100%",
            border: "1px solid #444",
            borderRadius: "8px",
            padding: "1.5rem",
            backgroundColor: "#2a2a2a"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: "0.5rem"
            }}>
              <h4 style={{ margin: 0, color: "#4dabf7", fontSize: "1.1rem" }}>{subject}</h4>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                  GitHub Token: <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="password"
                  value={tokens[subject] || ""}
                  onChange={(e) => handleTokenChange(subject, e.target.value)}
                  placeholder={`Token for ${subject}`}
                  style={{ padding: "0.4rem", borderRadius: "4px", border: "1px solid #555", minWidth: "250px", fontSize: "0.9rem" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
              {groupedData[subject].map((t, i) => (
                <div key={i} style={{
                  flex: "1 1 calc(25% - 0.75rem)",
                  minWidth: "200px",
                  backgroundColor: "#333",
                  padding: "0.8rem",
                  borderRadius: "6px"
                }}>
                  <h5 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#eee" }}>{t.name}</h5>
                  <div style={{ fontSize: "1rem", color: "#aaa", marginBottom: "0.6rem" }}>
                    <div style={{ marginBottom: "0.2rem" }}>Github: {t.identities.GITHUB?.url || "-"}</div>
                    <div>Taiga: {t.identities.TAIGA?.url || "-"}</div>
                  </div>

                  <div style={{ fontSize: "1rem" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "0.4rem", color: "#999" }}>Students:</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                      {t.students.map((s, idx) => (
                        <div key={idx} style={{ paddingLeft: "0.3rem", color: "#aaa", fontSize: "1rem" }}>
                          {s.name} <span style={{ opacity: 0.85 }}>(Github: {s.identities.GITHUB?.username || "-"} | Taiga: {s.identities.TAIGA?.username || "-"})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button
          className="custom-button"
          onClick={handleConfirmWithTokens}
          disabled={!allTokensFilled}
          style={{
            opacity: allTokensFilled ? 1 : 0.5,
            cursor: allTokensFilled ? "pointer" : "not-allowed"
          }}
        >
          Import {data.length} teams
        </button>
        <button className="custom-button secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default ImportProjectPreview;

