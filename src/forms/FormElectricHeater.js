// src/forms/FormElectricHeater.js

import React, { useState, useContext } from 'react';
import './DataForm.css';
import DataContext from '../context/DataContext'; // Import DataContext

function FormElectricHeater({ fetchedDevices = [], onClose }) {
  const { rooms, addElectricHeater, heaters } = useContext(DataContext); // Access heaters and functions from DataContext

  const [heaterId, setHeaterId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [roomId, setRoomId] = useState('');

  // State for error messages
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Trimmed inputs for accurate validation
    const trimmedHeaterId = heaterId.trim();
    const trimmedCapacity = capacity.toString().trim();
    const trimmedRoomId = roomId.trim();

    // Reset error
    setError('');

    // Validation: Ensure required fields are filled
    if (
      trimmedHeaterId === '' ||
      trimmedCapacity === '' ||
      trimmedRoomId === ''
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validation: Ensure capacity is greater than 0
    const parsedCapacity = parseFloat(capacity);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      setError('Capacity must be greater than 0.');
      return;
    }

    // Validation: Check if the selected heater is already assigned to any room
    const existingHeater = heaters.find(
      (heater) => heater.id.toLowerCase() === trimmedHeaterId.toLowerCase()
    );

    if (existingHeater) {
      if (existingHeater.roomId === trimmedRoomId) {
        // Heater is already assigned to the same room
        setError('This heater is already assigned to the selected room.');
      } else {
        // Heater is assigned to a different room
        setError('This heater is already assigned to another room and cannot be assigned to multiple rooms.');
      }
      return;
    }

    // Find the selected device's friendly_name
    const selectedDevice = fetchedDevices.find(device => device.entity_id === trimmedHeaterId);
    const heaterName = selectedDevice?.attributes?.friendly_name || trimmedHeaterId; // Fallback to heaterId if friendly_name is unavailable

    // Add heating device with isEnabled set to true and include name
    addElectricHeater({
      id: trimmedHeaterId, // Device ID
      name: heaterName, // Heater Name
      capacity: parsedCapacity, // Capacity in kW
      roomId: trimmedRoomId, // Associated Room ID
      isEnabled: false, // Initialize isEnabled as true
    });

    // Reset form
    setHeaterId('');
    setCapacity('');
    setRoomId('');

    // Close the modal after successful submission
    if (onClose) onClose();
  };

  return (
    <div className="device-form">
      <h3>Add a Heating Device</h3>
      {/* Display error message if any */}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* Dropdown for Home Assistant Devices */}
        <div className="input-group">
          <label htmlFor="heaterId">Select Device:</label>
          <select
            id="heaterId"
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
          <label htmlFor="capacity">Capacity (kW):</label>
          <input
            type="number"
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Enter Device Capacity in kW"
            required
            min="0.1" // Ensures user cannot input values less than or equal to 0
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label htmlFor="roomId">Room:</label>
          <select
            id="roomId"
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
