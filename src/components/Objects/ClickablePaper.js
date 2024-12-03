import React from 'react';
import PropTypes from 'prop-types';
import styles from './ClickablePaper.module.css'; // CSS Module for styling

/**
 * ClickablePaper Component
 *
 * A reusable component that renders a clickable paper-like UI element.
 * It handles mouse clicks and keyboard interactions for accessibility.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to display inside the paper.
 * @param {Function} props.onClick - Function to handle click events.
 * @param {string} props.ariaLabel - Accessible label for the clickable area.
 * @param {boolean} props.disabled - If true, the component is not clickable.
 */
function ClickablePaper({ children, onClick, ariaLabel, disabled }) {
  // Handle key press events for accessibility
  const handleKeyPress = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  };

  return (
    <div
      className={`${styles.clickablePaper} ${disabled ? styles.disabled : ''}`}
      onClick={!disabled ? onClick : undefined}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={ariaLabel}
      onKeyPress={handleKeyPress}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}

ClickablePaper.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

ClickablePaper.defaultProps = {
  onClick: () => {},
  disabled: false,
};

export default ClickablePaper;
