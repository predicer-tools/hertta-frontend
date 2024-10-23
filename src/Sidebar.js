// src/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Navigation</h2>
      <ul>
        <li><Link to="/">User Input</Link></li>
        <li><Link to="/device-cards">Data Table</Link></li>
        <li><Link to="/processes-graph">Processes Graph</Link></li>
        <li><Link to="/json-viewer">JSON Viewer</Link></li>
        <li><Link to="/electric-heaters">Electric Heaters</Link></li> {/* New Tab */}
      </ul>
    </div>
  );
}

export default Sidebar;
