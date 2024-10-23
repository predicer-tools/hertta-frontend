import React, { useState } from 'react';
import './DataForm.css';

function FormElectricHeater({ addElectricHeater, rooms }) {  // No need to pass apiKey anymore
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
    </div>
  );
}

export default FormElectricHeater;
