// DeviceControlTimeseries.js

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import './DeviceControlTimeseries.css'; // Import the CSS file

function DeviceControlTimeseries({ deviceId, onClose }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Generate dummy control signals for the next 6 hours, 15-minute intervals
    const generateDummyData = () => {
      const dataPoints = [];
      const now = new Date();
      for (let i = 0; i < 24; i++) { // 24 intervals (6 hours * 4)
        const time = new Date(now.getTime() + i * 15 * 60000); // 15 minutes in ms
        const status = Math.random() > 0.5 ? 'on' : 'off'; // Random on/off
        dataPoints.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: status === 'on' ? 1 : 0, // 1 for on, 0 for off
        });
      }
      return dataPoints;
    };

    setData(generateDummyData());
  }, [deviceId]);

  return (
    <div className="device-control-popup">
      <div className="device-control-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Control Signals for {deviceId}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              domain={[0, 1]}
              ticks={[0, 1]}
              tickFormatter={(tick) => tick === 1 ? 'On' : 'Off'}
              label={{ value: 'Status', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value) => value === 1 ? 'On' : 'Off'}
            />
            <Line type="monotone" dataKey="status" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DeviceControlTimeseries;
