// src/components/Modal/Modal.js

import React, { useEffect, useRef } from 'react';
import styles from './Modal.module.css';
import FocusTrap from 'focus-trap-react';

function Modal({ isOpen, onClose, children }) {
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <FocusTrap>
            <div
                className={`${styles.modalOverlay} ${isOpen ? styles.open : ''}`}
                onClick={onClose}
            >
                <div
                    className={styles.modalContent}
                    onClick={(e) => e.stopPropagation()}
                    ref={modalRef}
                >
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close Modal">
                        &times;
                    </button>
                    {children}
                </div>
            </div>
        </FocusTrap>
    );
}

export default Modal;
