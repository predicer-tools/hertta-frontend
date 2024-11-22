// src/Sidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen }) {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {isOpen && (
        <>
          <h2>Navigation</h2>
          <ul>
            {/* Updated Links */}
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => (isActive ? 'active-link' : '')}
                end
              >
                Processes Graph
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/input-data" 
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                Input Data
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/data-table" // Ensure this path matches App.js
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                Data Table
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/json-viewer" 
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                JSON Viewer
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/electric-heaters" 
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                Electric Heaters
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/weather-forecast" 
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                Weather Forecast
              </NavLink>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}

export default Sidebar;
