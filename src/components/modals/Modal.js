// src/components/Modal/Modal.js

import React from 'react';
import styles from './Modal.module.css'; // Import CSS Module

/**
 * Modal Component
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Determines if the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {React.ReactNode} props.children - Content of the modal
 */
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
