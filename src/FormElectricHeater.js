import React, { useState, useEffect } from 'react';
import './DataForm.css';

function FormElectricHeater({ addElectricHeater, rooms = [], fetchedDevices = [] }) {
  const [heaterId, setHeaterId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [roomId, setRoomId] = useState('');

  // Debugging to check fetchedDevices
  useEffect(() => {
    console.log('Fetched Devices:', fetchedDevices);
  }, [fetchedDevices]);

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
        <select value={heaterId} onChange={(e) => setHeaterId(e.target.value)}>
          <option value="">Select a Device</option>
          {fetchedDevices.map((device, index) => (
            <option key={index} value={device.entity_id}>
              {device.entity_id} ({device.attributes?.friendly_name || 'Unknown'})
            </option>
          ))}
        </select>
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
    </div>
  );
}

export default FormElectricHeater;
