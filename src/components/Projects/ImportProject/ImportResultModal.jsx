import React from "react";

function ImportResultModal({ result, onClose, onNextStep }) {
  if (!result) return null;

  const { data } = result;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(40,62,70,0.23)",
        zIndex: 7000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#222",
          color: "#fff",
          padding: "2em 3em",
          borderRadius: 10,
          position: "relative",
          boxShadow: "0 4px 18px #222d",
          textAlign: "left",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "auto",
          minWidth: "320px",
        }}
      >
        {/* Botó tancar */}
        <button
          style={{
            position: "absolute",
            top: 15,
            right: 23,
            fontSize: 21,
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          &times;
        </button>

        {/* Títol + icona resum */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              fontSize: 22,
              color: data.invalidCount > 0 ? "#bb0c00" : "#25971d",
              marginRight: 10,
            }}
          >
            {data.invalidCount > 0 ? "⚠️" : "✅"}
          </span>
          <h2 style={{ margin: 0, fontSize: 20 }}>
            Importació finalitzada
          </h2>
        </div>

        {/* Resum numèric */}
        <div
          style={{
            padding: "0.8rem 1rem",
            backgroundColor: "#2c2c2c",
            borderRadius: 6,
            marginBottom: "1.5rem",
            border: "1px solid #333",
          }}
        >
          <p style={{ margin: "0.25rem 0", fontSize: 14 }}>
            <strong>Total projectes:</strong> {data.totalProjects}
          </p>
          <p
            style={{
              margin: "0.25rem 0",
              fontSize: 14,
              color: "#25971d",
            }}
          >
            <strong>Projectes vàlids:</strong> {data.validCount}
          </p>
          <p
            style={{
              margin: "0.25rem 0",
              fontSize: 14,
              color: "#bb0c00",
            }}
          >
            <strong>Projectes amb errors:</strong> {data.invalidCount}
          </p>
        </div>

        {/* Projectes amb errors */}
        {data.invalidProjects && data.invalidProjects.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                color: "#ff6b6b",
                marginBottom: "0.8rem",
                fontSize: 16,
              }}
            >
              ❌ Projectes amb errors
            </h3>
            {data.invalidProjects.map((invalid, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #bb0c00",
                  padding: "0.8rem 1rem",
                  marginBottom: "0.8rem",
                  borderRadius: 6,
                  backgroundColor: "#331515",
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    marginBottom: "0.4rem",
                    color: "#ffd2d2",
                    fontSize: 14,
                  }}
                >
                  {invalid.project.name || invalid.project.externalId}
                </h4>

                {invalid.errors && invalid.errors.length > 0 && (
                  <div style={{ marginBottom: "0.4rem" }}>
                    <strong style={{ color: "#ffb3b3", fontSize: 13 }}>
                      Errors:
                    </strong>
                    <ul
                      style={{
                        marginTop: "0.2rem",
                        marginBottom: 0,
                        paddingLeft: "1.3rem",
                        fontSize: 13,
                      }}
                    >
                      {invalid.errors.map((error, i) => (
                        <li
                          key={i}
                          style={{
                            color: "#ffd2d2",
                            marginBottom: "0.2rem",
                          }}
                        >
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {invalid.warnings && invalid.warnings.length > 0 && (
                  <div>
                    <strong style={{ color: "#ffe08a", fontSize: 13 }}>
                      Avisos:
                    </strong>
                    <ul
                      style={{
                        marginTop: "0.2rem",
                        marginBottom: 0,
                        paddingLeft: "1.3rem",
                        fontSize: 13,
                      }}
                    >
                      {invalid.warnings.map((warning, i) => (
                        <li
                          key={i}
                          style={{
                            color: "#ffe08a",
                            marginBottom: "0.2rem",
                          }}
                        >
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projectes vàlids */}
        {data.validProjects && data.validProjects.length > 0 && (
          <div>
            <h3
              style={{
                color: "#8be28b",
                marginBottom: "0.8rem",
                fontSize: 16,
              }}
            >
              ✅ Projectes importats correctament
            </h3>
            <div
              style={{
                backgroundColor: "#163016",
                border: "1px solid #25971d",
                borderRadius: 6,
                padding: "0.8rem 1rem",
              }}
            >
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.3rem",
                  fontSize: 13,
                }}
              >
                {data.validProjects.map((project, idx) => (
                  <li
                    key={idx}
                    style={{ color: "#d6ffd6", marginBottom: "0.2rem" }}
                  >
                    {project.name || project.externalId}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Botons d'acció */}
        <div style={{ textAlign: "center", marginTop: "1.8rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
          <button
            onClick={onClose}
            style={{
              padding: "0.6rem 1.8rem",
              fontSize: 14,
              backgroundColor: "#555",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Tornar a importar
          </button>
          {onNextStep && (
            <button
              onClick={onNextStep}
              style={{
                padding: "0.6rem 1.8rem",
                fontSize: 14,
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Següent pas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportResultModal;
