import React, { useState }  from "react";


function ImportProjectPreview({ data, onConfirm, onCancel }) {
  const [tokens, setTokens] = useState({});
  
  if (!data || data.length === 0) return null;

  const handleTokenChange = (index, value) => {
    setTokens(prev => ({ ...prev, [index]: value }));
  };

  const allTokensFilled = data.every((_, index) => tokens[index]?.trim());

  const handleConfirmWithTokens = () => {
    const dataWithTokens = data.map((team, index) => ({
      ...team,
      githubToken: tokens[index]
    }));
    onConfirm(dataWithTokens);
  };

  return (
    <div>
      <h3>Import preview</h3>
      {data.map((t, i) => (
        <div key={i} style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem" }}>
          <h4>{t.name}</h4>
          <p>
            GitHub: {t.identities.GITHUB?.url || "-"} <br />
            Taiga: {t.identities.TAIGA?.url || "-"}
          </p>
          <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <label style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
              GitHub Token: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={tokens[i] || ""}
              onChange={(e) => handleTokenChange(i, e.target.value)}
              placeholder="Introduce the GitHub token for this team"
              style={{ minWidth: "300px", padding: "0.3rem" }}
            />
          </div>
          <ul>
            {t.students.map((s, idx) => (
              <li key={idx}>
                {s.name} - GH: {s.identities.GITHUB?.username || "-"} - TG: {s.identities.TAIGA?.username || "-"}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button 
        onClick={handleConfirmWithTokens} 
        disabled={!allTokensFilled}
        style={{ 
          opacity: allTokensFilled ? 1 : 0.5,
          cursor: allTokensFilled ? "pointer" : "not-allowed"
        }}
      >
        Import teams
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

export default ImportProjectPreview;
