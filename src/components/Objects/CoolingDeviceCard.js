import React, { useEffect, useState } from 'react';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PropTypes from 'prop-types';
import styles from './HeatPumpCard.module.css';

const HASS_BACKEND_URL = window.location.pathname.replace(/\/$/, '');

function CoolingDeviceCard({ coolingDevice }) {
  const [haState, setHaState] = useState(null);
  const [haError, setHaError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHAState() {
      try {
        const response = await fetch(
          `${HASS_BACKEND_URL}/ha-state/${encodeURIComponent(coolingDevice.id)}`
        );
        const result = await response.json();
        if (cancelled) return;
        if (result.status === 'ok') {
          setHaState(result.data?.state ?? null);
          setHaError(null);
        } else {
          setHaError(result.message || 'Failed to fetch Home Assistant state');
        }
      } catch (error) {
        if (!cancelled) setHaError(error.message || 'Network error');
      }
    }

    fetchHAState();
    const intervalId = setInterval(fetchHAState, 30000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [coolingDevice.id]);

  const electricalCapacity = Number(coolingDevice.electricalCapacity);
  const coolingCapacity = electricalCapacity * Number(coolingDevice.coolingCop);
  const stateLabel = coolingDevice.isEnabled === false ? 'Disabled' : haState || 'Unknown';

  return (
    <div className={styles.heatPumpCard}>
      <div className={styles.header}>
        <AcUnitIcon className={styles.icon} />
        <div>
          <h4 className={styles.name}>{coolingDevice.name}</h4>
          <p className={styles.entityId}>{coolingDevice.id}</p>
        </div>
        <span className={styles.state}>{stateLabel}</span>
      </div>

      <div className={`${styles.metrics} ${styles.twoMetrics}`}>
        <div>
          <span>Electrical</span>
          <strong>{electricalCapacity.toFixed(2)} kW</strong>
        </div>
        <div>
          <span>Cooling</span>
          <strong>{coolingCapacity.toFixed(2)} kW</strong>
          <small>COP {Number(coolingDevice.coolingCop).toFixed(2)}</small>
        </div>
      </div>

      {haError && <p className={styles.error}>Home Assistant state unavailable</p>}
    </div>
  );
}

CoolingDeviceCard.propTypes = {
  coolingDevice: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    roomId: PropTypes.string.isRequired,
    electricalCapacity: PropTypes.number.isRequired,
    coolingCop: PropTypes.number.isRequired,
    isEnabled: PropTypes.bool,
  }).isRequired,
};

export default CoolingDeviceCard;
