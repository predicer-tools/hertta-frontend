// src/forms/FormElectricHeater.js

import React, { useState, useContext } from 'react';
import './DataForm.css';
import DataContext from '../context/DataContext';

function FormElectricHeater({ fetchedDevices = [], onClose }) {
  const { rooms, addElectricHeater, heaters } = useContext(DataContext);

  const [heaterId, setHeaterId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedHeaterId = heaterId.trim();
    const trimmedCapacity = capacity.toString().trim();
    const trimmedRoomId = roomId.trim();
    setError('');

    if (!trimmedHeaterId || !trimmedCapacity || !trimmedRoomId) {
      setError('Please fill in all required fields.');
      return;
    }

    // Capacity must be > 0
    const parsedCapacity = parseFloat(capacity);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      setError('Capacity must be greater than 0.');
      return;
    }

    // Prevent duplicate heater IDs
    const existingHeater = heaters.find(
      (h) => h.id.toLowerCase() === trimmedHeaterId.toLowerCase()
    );
    if (existingHeater) {
      if (existingHeater.roomId === trimmedRoomId) {
        setError('This heater is already assigned to the selected room.');
      } else {
        setError(
          'This heater is already assigned to another room and cannot be assigned to multiple rooms.'
        );
      }
      return;
    }

    // Friendly name from fetched devices, fallback to id
    const selectedDevice = fetchedDevices.find(
      (d) => d.entity_id === trimmedHeaterId
    );
    const heaterName =
      selectedDevice?.attributes?.friendly_name || trimmedHeaterId;

    // Add to context (DataContext will handle process/topologies)
    addElectricHeater({
      id: trimmedHeaterId,
      name: heaterName,
      capacity: parsedCapacity,
      roomId: trimmedRoomId,
    });

    // Clear form
    setHeaterId('');
    setCapacity('');
    setRoomId('');
    setError('');

    if (onClose) onClose();
  };

  return (
    <div className="device-form">
      <h3>Add a Heating Device</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* Device selector */}
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

        {/* Capacity */}
        <div className="input-group">
          <label htmlFor="capacity">Capacity (kW):</label>
          <input
            type="number"
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Enter Device Capacity in kW"
            required
            min="0.1"
            step="0.1"
          />
        </div>

        {/* Room selector */}
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
