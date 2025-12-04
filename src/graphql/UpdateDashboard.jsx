// UpdateDashboard.jsx
import React, { useState } from "react";
import InputDataSetupPage from "./InputDataSetupPage";
// Import other update pages when available. For example:
// import OtherUpdatePage from "./OtherUpdatePage";

const UpdateDashboard = () => {
  // Set up state to track which update component is active.
  const [activeTab, setActiveTab] = useState("inputDataSetup");

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Update Dashboard</h1>
      {/* Navigation: You can style these buttons as needed */}
      <nav style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("inputDataSetup")}
          style={{
            marginRight: "1rem",
            backgroundColor: activeTab === "inputDataSetup" ? "#ddd" : "#fff",
          }}
        >
          Input Data Setup
        </button>
        {/* Uncomment and adjust when you add more pages */}
        {/*
        <button
          onClick={() => setActiveTab("otherUpdate")}
          style={{
            marginRight: "1rem",
            backgroundColor: activeTab === "otherUpdate" ? "#ddd" : "#fff",
          }}
        >
          Other Update
        </button>
        */}
      </nav>

      {/* Render the active component based on the selected tab */}
      <div>
        {activeTab === "inputDataSetup" && <InputDataSetupPage />}
        {/* {activeTab === "otherUpdate" && <OtherUpdatePage />} */}
      </div>
    </div>
  );
};

export default UpdateDashboard;
