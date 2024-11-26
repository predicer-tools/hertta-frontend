// src/components/Button/LogoutButton.js

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfigContext from '../../context/ConfigContext';
import styles from './Button.module.css'; // Optional: If you have specific styles

function LogoutButton({ className }) {
  const { resetConfig } = useContext(ConfigContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout? This will reset your configuration.');
    if (confirmLogout) {
      resetConfig();
      navigate('/config'); // Redirect to ConfigPage after logout/reset
    }
  };

  return (
    <button onClick={handleLogout} className={`${styles.button} ${className}`}>
      Logout
    </button>
  );
}

export default LogoutButton;
