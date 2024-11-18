// src/Popup.js

import React from 'react';
import './Popup.css'; // Import the Popup CSS

function Popup({ children, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default Popup;
