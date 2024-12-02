// src/components/Sidebar/Sidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css'; // Import CSS Module
import ResetButton from '../Button/ResetButton';

function Sidebar({ isOpen }) {
  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <h2 className={styles.title}>Hertta Add-on</h2>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
            >
              Home Energy
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/input-data"
              className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
            >
              Input Data
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/config"
              className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
            >
              Configuration
            </NavLink>
          </li>
          {/* Add more navigation links as needed */}
        </ul>
      </nav>
      <div className={styles.resetContainer}>
        {/* Replace LogoutButton with ResetButton */}
        <ResetButton />
      </div>
    </div>
  );
}

export default Sidebar;
