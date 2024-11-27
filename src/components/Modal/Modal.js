// src/components/Modal/Modal.js

import React from 'react';
import styles from './Modal.module.css'; // Ensure this CSS module exists

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
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button className={styles.closeButton} onClick={onClose} aria-label="Close Modal">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
