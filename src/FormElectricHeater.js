// src/FormElectricHeater.js

import React, { useState, useEffect } from 'react';
import './DataForm.css';

function FormElectricHeater({ addElectricHeater, rooms = [], fetchedDevices = [] }) {
  const [heaterId, setHeaterId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [roomId, setRoomId] = useState('');

  // Toggle between API Device and Test Device
  const [useTestDevice, setUseTestDevice] = useState(false);
  const [testDeviceId, setTestDeviceId] = useState(''); // State to store test device ID

  // Debugging to check fetchedDevices
  useEffect(() => {
    console.log('Fetched Devices:', fetchedDevices);
  }, [fetchedDevices]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const deviceToUse = useTestDevice ? testDeviceId : heaterId;

    // Validation
    if (
      deviceToUse.trim() && // Check for a valid device ID
      capacity.trim() && // Capacity is required
      roomId.trim() // Room selection is required
    ) {
      // Add electric heater with sensor state information and selected material
      addElectricHeater({
        id: deviceToUse, // Add the device ID (either selected or test)
        capacity: parseFloat(capacity),
        roomId,
        isTestDevice: useTestDevice, // Flag to indicate if it's a test device
      });

      // Reset form
      setHeaterId('');
      setCapacity('');
      setRoomId('');
      setUseTestDevice(false);
      setTestDeviceId('');
    } else {
      alert('Please fill in all required fields.');
    }
  };

  return (
    <div className="device-form">
      <div className="input-group">
        <label>Heater ID (Lamp):</label>
        {/* Toggle Between API Device and Test Device */}
        <div className="toggle-group">
          <label>
            <input
              type="radio"
              name="deviceSource"
              value="api"
              checked={!useTestDevice}
              onChange={() => setUseTestDevice(false)}
            />
            API Device
          </label>
          <label>
            <input
              type="radio"
              name="deviceSource"
              value="test"
              checked={useTestDevice}
              onChange={() => setUseTestDevice(true)}
            />
            Test Device
          </label>
        </div>
      </div>

      {/* Dropdown for Home Assistant Devices */}
      {!useTestDevice && (
        <div className="input-group">
          <label>Select Device:</label>
          <select value={heaterId} onChange={(e) => setHeaterId(e.target.value)}>
            <option value="">Select a Device</option>
            {fetchedDevices.map((device, index) => (
              <option key={device.entity_id || index} value={device.entity_id}>
                {device.entity_id} ({device.attributes?.friendly_name || 'Unknown'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Input for Test Device */}
      {useTestDevice && (
        <div className="input-group">
          <label>Enter Test Device ID:</label>
          <input
            type="text"
            value={testDeviceId}
            onChange={(e) => setTestDeviceId(e.target.value)}
            placeholder="Enter Test Device ID"
          />
        </div>
      )}

      <div className="input-group">
        <label>Capacity (kW):</label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="Enter Heater Capacity in kW"
        />
      </div>
      <div className="input-group">
        <label>Room:</label>
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          <option value="">Select a Room</option>
          {rooms.map((room, index) => (
            <option key={room.roomId || index} value={room.roomId}>
              {room.roomId}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" onClick={handleSubmit}>
        Add Heater (Lamp)
      </button>
    </div>
  );
}

export default FormElectricHeater;
