import React, { useState } from 'react';
import './DataForm.css';

function FormElectricHeater({ addElectricHeater, rooms = [], fetchedDevices = [] }) {
  const [heaterId, setHeaterId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (
      heaterId.trim() && // Check for a valid device ID
      capacity.trim() && // Capacity is required
      roomId.trim() // Room selection is required
    ) {
      // Add heating device
      addElectricHeater({
        id: heaterId, // Device ID
        capacity: parseFloat(capacity), // Capacity in kW
        roomId, // Associated Room ID
      });

      // Reset form
      setHeaterId('');
      setCapacity('');
      setRoomId('');
    } else {
      alert('Please fill in all required fields.');
    }
  };

  return (
    <div className="device-form">
      <h3>Add a Heating Device</h3>
      <form onSubmit={handleSubmit}>
        {/* Dropdown for Home Assistant Devices */}
        <div className="input-group">
          <label>Select Device:</label>
          <select
            value={heaterId}
            onChange={(e) => setHeaterId(e.target.value)}
            required
          >
            <option value="">Select a Device</option>
            {fetchedDevices.map((device, index) => (
              <option key={device.entity_id || index} value={device.entity_id}>
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
            placeholder="Enter Device Capacity in kW"
            required
            min="0"
            step="0.1"
          />
        </div>
        <div className="input-group">
          <label>Room:</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          >
            <option value="">Select a Room</option>
            {rooms.map((room, index) => (
              <option key={room.roomId || index} value={room.roomId}>
                {room.roomId}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Add Heating Device</button>
      </form>
    </div>
  );
}

export default FormElectricHeater;
