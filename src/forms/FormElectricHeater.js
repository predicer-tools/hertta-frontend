// src/components/Forms/FormElectricHeater.js

import React, { useState, useContext } from 'react';
import './DataForm.css';
import DataContext from '../context/DataContext'; // Import DataContext

function FormElectricHeater({ addElectricHeater, rooms = [], fetchedDevices = [] }) {
  const { addElectricHeater: addHeater } = useContext(DataContext); // Access addHeater from DataContext

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
      // Find the selected device's friendly_name
      const selectedDevice = fetchedDevices.find(device => device.entity_id === heaterId);
      const heaterName = selectedDevice?.attributes?.friendly_name || heaterId; // Fallback to heaterId if friendly_name is unavailable

      // Add heating device with isEnabled set to true and include name
      addHeater({
        id: heaterId, // Device ID
        name: heaterName, // Heater Name
        capacity: parseFloat(capacity), // Capacity in kW
        roomId, // Associated Room ID
        isEnabled: true, // Initialize isEnabled as true
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
                {device.attributes?.friendly_name || device.entity_id}
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
