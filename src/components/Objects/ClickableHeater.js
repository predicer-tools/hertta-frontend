// src/components/Objects/ClickableHeater.js

import React from 'react';
import PropTypes from 'prop-types';
import styles from './ClickableHeater.module.css'; // CSS Module for styling

/**
 * ClickableHeater Component
 *
 * Represents an electric heater that is clickable and opens a modal for editing.
 *
 * @param {Object} props
 * @param {Object} props.heater - The heater object containing its details.
 * @param {Function} props.onClick - Function to handle click events.
 */
function ClickableHeater({ heater, onClick }) {
  return (
    <div
      className={styles.clickableHeater}
      onClick={() => onClick(heater)}
      tabIndex={0}
      role="button"
      aria-label={`Edit ${heater.name}`}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(heater);
        }
      }}
    >
      <h4 className={styles.heaterName}>{heater.name}</h4>
      <p className={styles.heaterStatus}>
        Status: {heater.isEnabled ? 'Enabled' : 'Disabled'}
      </p>
    </div>
  );
}

ClickableHeater.propTypes = {
  heater: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isEnabled: PropTypes.bool.isRequired,
    roomId: PropTypes.string.isRequired,
    capacity: PropTypes.number.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ClickableHeater;
