import React from "react";

function FeedbackMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(40,62,70,0.23)", zIndex: 7000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#222", color: "#fff",
        padding: "2em 3em", borderRadius: 10,
        position: "relative", boxShadow: "0 4px 18px #222d",
        textAlign: "center", minWidth: "300px"
      }}>
        <span style={{
          fontSize: 20,
          color: message.type === 'success' ? "#25971d" : "#bb0c00"
        }}>
          {message.type === "success"
            ? <>&#x2705;</>
            : <>&#x26A0;</>
          }
        </span>
        <span style={{ marginLeft: 10 }}>{message.text}</span>
        <button
          style={{
            position: "absolute",
            top: 15, right: 23,
            fontSize: 21, background: "none",
            border: "none", color: "#fff", cursor: "pointer"
          }}
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
}

export default FeedbackMessage;
