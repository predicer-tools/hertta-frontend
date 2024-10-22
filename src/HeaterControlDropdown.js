import React, { useState } from 'react';
import { controlElectricHeater } from './ElectricHeaterControl'; // Import control functions

function HeaterControlDropdown({ electricHeaters, apiKey }) {
  const [selectedHeaterId, setSelectedHeaterId] = useState('');

  const handleHeaterSelection = (e) => {
    setSelectedHeaterId(e.target.value);
  };

  const handleTurnOn = () => {
    if (selectedHeaterId) {
      controlElectricHeater(selectedHeaterId, 'turn_on', apiKey);
    } else {
      alert('Please select a heater to control');
    }
  };

  const handleTurnOff = () => {
    if (selectedHeaterId) {
      controlElectricHeater(selectedHeaterId, 'turn_off', apiKey);
    } else {
      alert('Please select a heater to control');
    }
  };

  return (
    <div className="device-form">
      <div className="input-group">
        <label>Select Electric Heater:</label>
        <select value={selectedHeaterId} onChange={handleHeaterSelection}>
          <option value="">Select a Heater</option>
          {electricHeaters.map((heater, index) => (
            <option key={index} value={heater.id}>
              {heater.id} (Room: {heater.roomId})
            </option>
          ))}
        </select>
      </div>

      {/* Buttons to control the heater */}
      <button onClick={handleTurnOn}>Turn On Heater</button>
      <button onClick={handleTurnOff}>Turn Off Heater</button>
    </div>
  );
}

export default HeaterControlDropdown;
