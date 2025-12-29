import React, { useState } from "react";
import Wizard from "../components/Wizard/Wizard";
import PageProjects from "../components/Projects/PageProjects";
import "../styles.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("wizard");

  return (
    <div className="admin-dashboard">
      <h2>Admin Tool</h2>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'wizard' ? 'active' : ''}`}
          onClick={() => setActiveTab('wizard')}
        >
          Configuration
        </button>
        <button
          className={`tab-button ${activeTab === 'management' ? 'active' : ''}`}
          onClick={() => setActiveTab('management')}
        >
          Management (Edit/Delete)
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'wizard' && <Wizard />}
        {activeTab === 'management' && <PageProjects />}
      </div>
    </div>
  );
}

export default AdminDashboard;
