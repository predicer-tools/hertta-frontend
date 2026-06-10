import React from 'react';
import PropTypes from 'prop-types';
import styles from './ClickablePaper.module.css';

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
const ClickablePaper = React.forwardRef(function ClickablePaper(
  {
    children,
    onClick = () => {},
    ariaLabel,
    disabled = false,
    className = '',
    ...other
  },
  ref
) {
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      {...other}
      ref={ref}
      className={`${styles.clickablePaper} ${disabled ? styles.disabled : ''} ${className}`.trim()}
      onClick={!disabled ? onClick : undefined}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
});

ClickablePaper.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default ClickablePaper;
