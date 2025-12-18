import React, { useState } from "react";
import EditProjectForm from "./EditProjectForm";
import '../../../styles.css';

function EditProject({ initialProject, onBack, onUpdate }) {
  if (!initialProject) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>No project selected.</p>
        <button className="back-button" onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div className="edit-container">
      <EditProjectForm
        project={initialProject}
        onDone={() => {
          onUpdate();
          onBack(); // Go back to the dashboard
        }}
        onBack={onBack}
      />
    </div>
  );
}

export default EditProject;
