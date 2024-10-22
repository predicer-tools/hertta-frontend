import React, { useState } from 'react';
import './DataForm.css';
import { controlElectricHeater, triggerTimeSeriesControl } from './ElectricHeaterControl'; // Import control functions

function FormElectricHeater({ addElectricHeater, rooms, apiKey }) {  // Pass the API Key from props
  const [heaterId, setHeaterId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (heaterId && capacity && roomId) {
      addElectricHeater({
        id: heaterId,
        capacity: parseFloat(capacity),
        roomId,
      });
      setHeaterId('');
      setCapacity('');
      setRoomId('');
    }
  };

  return (
    <div className="device-form">
      <div className="input-group">
        <label>Heater ID (Lamp):</label>
        <input
          type="text"
          value={heaterId}
          onChange={(e) => setHeaterId(e.target.value)}
          placeholder="electric_heater"  // You can make this default
        />
      </div>
      <div className="input-group">
        <label>Capacity (kW):</label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Room:</label>
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          <option value="">Select a Room</option>
          {rooms.map((room, index) => (
            <option key={index} value={room.roomId}>
              {room.roomId}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" onClick={handleSubmit}>Add Heater (Lamp)</button>

      {/* On/Off buttons for controlling the lamp */}
      <button onClick={() => controlElectricHeater('electric_heater', 'turn_on', apiKey)}>Turn On Heater</button>
      <button onClick={() => controlElectricHeater('electric_heater', 'turn_off', apiKey)}>Turn Off Heater</button>

      {/* Button for time-series control */}
      <button onClick={() => triggerTimeSeriesControl('electric_heater')}>Start Time-Series Control</button>
    </div>
  );
}

export default FormElectricHeater;
