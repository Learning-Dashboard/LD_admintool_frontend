import React, { useState } from "react";
import PageProjects from "../components/Projects/PageProjects";
import PageCategories from "../components/Categories/PageCategories";
import "../styles.css";

function AdminDashboard() {
  const [selection, setSelection] = useState(null);

  return (
    <div>
      <h2>Admin Tool</h2>
      {!selection && (
        <div>
          <button className="custom-button" onClick={() => setSelection("projects")}>Projects</button>
          <button className="custom-button" onClick={() => setSelection("categories")}>Categories</button>
        </div>
      )}
      {selection === "projects" && (
        <PageProjects onBack={() => setSelection(null)} />
      )}
      {selection === "categories" && (
        <PageCategories onBack={() => setSelection(null)} />
      )}
    </div>
  );
}

export default AdminDashboard;
