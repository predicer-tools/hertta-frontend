import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css'; // Import CSS Module

function Sidebar({ isOpen }) {
  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <h2>Hertta Add-on</h2>
      <ul>
        <li>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles['active-link'] : '')}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/config" className={({ isActive }) => (isActive ? styles['active-link'] : '')}>
            Configuration
          </NavLink>
        </li>
        <li>
          <NavLink to="/input-data" className={({ isActive }) => (isActive ? styles['active-link'] : '')}>
            Input Data
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? styles['active-link'] : '')}>
            Dashboard
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
