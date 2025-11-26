import React from "react";

function ImportProjectPreview({ data, onConfirm, onCancel }) {
  if (!data || data.length === 0) return null;

  return (
    <div>
      <h3>Previsualització de l’importació</h3>
      {data.map((t, i) => (
        <div key={i} style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem" }}>
          <h4>{t.name}</h4>
          <p>
            GitHub: {t.identities.GITHUB?.url || "-"} <br />
            Taiga: {t.identities.TAIGA?.url || "-"}
          </p>
          <ul>
            {t.students.map((s, idx) => (
              <li key={idx}>
                {s.name} - GH: {s.identities.GITHUB?.username || "-"} - TG: {s.identities.TAIGA?.username || "-"}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={onConfirm}>Confirmar importació</button>
      <button onClick={onCancel}>Cancel·lar</button>
    </div>
  );
}

export default ImportProjectPreview;
