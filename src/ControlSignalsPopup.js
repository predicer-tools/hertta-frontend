import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import './ControlSignalsPopup.css';

function ControlSignalsPopup({ isOpen, onClose, deviceId, controlSignals }) {
  // Render nothing if deviceId is not valid
  if (!isOpen || !deviceId) return null;

  console.log('ControlSignalsPopup Props:', { deviceId, controlSignals });

  const data = controlSignals.map(signal => ({
    time: signal.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: signal.status === 'on' ? 1 : 0, // Convert status to numerical value for the chart
  }));

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Control Signals for {deviceId}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis 
              domain={[0, 1]}
              ticks={[0, 1]}
              tickFormatter={(value) => (value === 1 ? 'On' : 'Off')}
              allowDecimals={false}
            />
            <RechartsTooltip 
              formatter={(value) => (value === 1 ? 'On' : 'Off')}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line type="monotone" dataKey="status" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

ControlSignalsPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  deviceId: PropTypes.string,
  controlSignals: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.instanceOf(Date).isRequired,
      status: PropTypes.oneOf(['on', 'off']).isRequired,
    })
  ).isRequired,
};

export default ControlSignalsPopup;
