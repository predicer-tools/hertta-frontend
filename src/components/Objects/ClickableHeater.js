// src/components/Objects/ClickableHeater.js

import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ClickableHeater.module.css';
import DataContext from '../../context/DataContext';

const HASS_BACKEND_URL = 'http://localhost:4001';

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
  const { controlSignals } = useContext(DataContext);

  const [haState, setHaState] = useState(null);
  const [haLoading, setHaLoading] = useState(false);
  const [haError, setHaError] = useState(null);


  const entityId = heater.id;

  useEffect(() => {
    let cancelled = false;

    async function fetchHAState() {
      setHaLoading(true);
      setHaError(null);
      try {
        const res = await fetch(
          `${HASS_BACKEND_URL}/ha-state/${encodeURIComponent(entityId)}`
        );
        const json = await res.json();

        if (cancelled) return;

        if (json.status === 'ok') {
          const stateFromHA = json.data?.state || null; // "on" | "off" | etc.
          setHaState(stateFromHA);
        } else {
          setHaError(json.message || 'Failed to fetch HA state');
        }
      } catch (e) {
        if (!cancelled) {
          setHaError(e.message || 'Network error');
        }
      } finally {
        if (!cancelled) {
          setHaLoading(false);
        }
      }
    }

    fetchHAState();

    const intervalId = setInterval(fetchHAState, 30000); // every 30s

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [entityId]);

  // Determine current state for UI
  // Priority:
  // 1. If heater disabled => always OFF
  // 2. Else if we have HA state => use that
  // 3. Else fall back to controlSignals (old behaviour)
  let currentState;

  if (!heater.isEnabled) {
    currentState = 'OFF';
  } else if (haState != null) {

    currentState = haState === 'on' ? 'ON' : 'OFF';
  } else {

    const signalArray = controlSignals[heater.id];
    const signalValue =
      Array.isArray(signalArray) && signalArray.length > 0
        ? signalArray[0]
        : 'OFF';

    currentState =
      typeof signalValue === 'string'
        ? signalValue.toUpperCase() === 'ON'
          ? 'ON'
          : 'OFF'
        : signalValue > 0
        ? 'ON'
        : 'OFF';
  }

  const stateClass = currentState === 'ON' ? styles.on : styles.off;
  const stateTextClass = currentState === 'ON' ? styles.stateOn : styles.stateOff;

  return (
    <div
      className={`${styles.clickableHeater} ${stateClass}`}
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

      <p className={styles.heaterState}>
        Current State:{' '}
        <span className={stateTextClass}>{currentState}</span>
      </p>

      {haLoading && (
        <p className={styles.heaterMeta}>HA: loading…</p>
      )}
      {haError && (
        <p className={styles.heaterMetaError}>HA error</p>
      )}
      {!haLoading && !haError && haState != null && (
        <p className={styles.heaterMeta}>
          HA state: <code>{haState}</code>
        </p>
      )}
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
