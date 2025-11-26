import React, { useState } from "react";
import EditProject from "./EditProject/EditProject";
import DeleteProject from "./DeleteProject";
import ImportProject from "./ImportProject/ImportProject";
import "../../styles.css";

function PageProjects({ onBack }) {
  const [action, setAction] = useState(null);

  if (!action) {
    return (
      <div>
        <h3>Projects</h3>
        <div>
          <button className="custom-button" onClick={() => setAction("create")}>Create/Import</button>
          <button className="custom-button" onClick={() => setAction("edit")}>Edit</button>
          <button className="custom-button" onClick={() => setAction("delete")}>Delete</button>
        </div>
        <div style={{ marginTop: "2rem" }}>
          <button className="back-button" onClick={onBack}>Back</button>
        </div>
      </div>
    );
  }
  if (action === "create") {
    return <ImportProject onBack={() => setAction(null)} />;
  }
  if (action === "edit") {
    return <EditProject onBack={() => setAction(null)} />;
  }
  if (action === "delete") {
    return <DeleteProject onBack={() => setAction(null)} />;
  }
}

export default PageProjects;
