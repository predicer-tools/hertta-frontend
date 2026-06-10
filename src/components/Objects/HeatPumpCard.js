import React, { useEffect, useState } from 'react';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PropTypes from 'prop-types';
import styles from './HeatPumpCard.module.css';

const HASS_BACKEND_URL = 'http://localhost:4001';

function HeatPumpCard({ heatPump }) {
  const [haState, setHaState] = useState(null);
  const [haLoading, setHaLoading] = useState(false);
  const [haError, setHaError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHAState() {
      setHaLoading(true);
      setHaError(null);
      try {
        const response = await fetch(
          `${HASS_BACKEND_URL}/ha-state/${encodeURIComponent(heatPump.id)}`
        );
        const result = await response.json();
        if (cancelled) return;

        if (result.status === 'ok') {
          setHaState(result.data?.state ?? null);
        } else {
          setHaError(result.message || 'Failed to fetch Home Assistant state');
        }
      } catch (error) {
        if (!cancelled) setHaError(error.message || 'Network error');
      } finally {
        if (!cancelled) setHaLoading(false);
      }
    }

    fetchHAState();
    const intervalId = setInterval(fetchHAState, 30000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [heatPump.id]);

  const electricalCapacity = Number(heatPump.electricalCapacity);
  const heatingCapacity = electricalCapacity * Number(heatPump.heatingCop);
  const coolingCapacity = electricalCapacity * Number(heatPump.coolingCop);
  const stateLabel = heatPump.isEnabled === false ? 'Disabled' : haState || 'Unknown';

  return (
    <div className={styles.heatPumpCard}>
      <div className={styles.header}>
        <AcUnitIcon className={styles.icon} />
        <div>
          <h4 className={styles.name}>{heatPump.name}</h4>
          <p className={styles.entityId}>{heatPump.id}</p>
        </div>
        <span className={styles.state}>{stateLabel}</span>
      </div>

      <div className={styles.metrics}>
        <div>
          <span>Electrical</span>
          <strong>{electricalCapacity.toFixed(1)} kW</strong>
        </div>
        <div>
          <span>Heating</span>
          <strong>{heatingCapacity.toFixed(1)} kW</strong>
          <small>COP {Number(heatPump.heatingCop).toFixed(1)}</small>
        </div>
        <div>
          <span>Cooling</span>
          <strong>{coolingCapacity.toFixed(1)} kW</strong>
          <small>COP {Number(heatPump.coolingCop).toFixed(1)}</small>
        </div>
      </div>

      {haLoading && <p className={styles.meta}>Updating Home Assistant state...</p>}
      {haError && <p className={styles.error}>Home Assistant state unavailable</p>}
    </div>
  );
}

HeatPumpCard.propTypes = {
  heatPump: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    roomId: PropTypes.string.isRequired,
    electricalCapacity: PropTypes.number.isRequired,
    heatingCop: PropTypes.number.isRequired,
    coolingCop: PropTypes.number.isRequired,
    isEnabled: PropTypes.bool,
  }).isRequired,
};

export default HeatPumpCard;
