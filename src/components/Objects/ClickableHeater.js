// src/components/Objects/ClickableHeater.js 

import React, { useContext } from 'react'; // Import useContext
import PropTypes from 'prop-types';
import styles from './ClickableHeater.module.css'; // CSS Module for styling
import DataContext from '../../context/DataContext'; // Adjust the import path as necessary

/**
 * ClickableHeater Component
 *
 * Represents an electric heater that is clickable and allows viewing/editing its details.
 *
 * @param {Object} props
 * @param {Object} props.heater - The heater object containing its details.
 * @param {Function} props.onClick - Function to handle click events (e.g., open edit modal).
 */
function ClickableHeater({ heater, onClick }) {
  const { controlSignals } = useContext(DataContext); // Access controlSignals from DataContext

  // Determine current state:
  // - If heater is disabled, state is always 'OFF'
  // - If enabled, use the first value from controlSignals[heater.id] or default to 'OFF'
  const currentState = !heater.isEnabled
    ? 'OFF'
    : (Array.isArray(controlSignals[heater.id]) && controlSignals[heater.id].length > 0
        ? controlSignals[heater.id][0]
        : 'OFF');

  // Determine CSS class based on currentState
  const stateClass = currentState === 'ON' ? styles.on : styles.off;
  
  // Determine state text class for coloring
  const stateTextClass = currentState === 'ON' ? styles.stateOn : styles.stateOff;

  return (
    <div
      className={`${styles.clickableHeater} ${stateClass}`} // Apply both classes
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
      
      {/* Display Enabled Status */}
      <p className={styles.heaterStatus}>
        Enabled: {heater.isEnabled ? 'Yes' : 'No'}
      </p>
      
      {/* Display Current State */}
      <p className={styles.heaterState}>
        Current State: <span className={stateTextClass}>{currentState}</span>
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
