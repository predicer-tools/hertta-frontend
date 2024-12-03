// src/forms/FormRoom.js

import React, { useState, useContext } from 'react';
import './DataForm.css'; // Import the updated CSS
import DataContext from '../context/DataContext'; // Import DataContext

function FormRoom({ homeAssistantSensors }) {
  const { addRoom, rooms } = useContext(DataContext); // Access addRoom and existing rooms from DataContext

  // Form state variables
  const [roomId, setRoomId] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [roomLength, setRoomLength] = useState('');
  const [maxTemp, setMaxTemp] = useState(''); 
  const [minTemp, setMinTemp] = useState(''); 
  const [selectedSensor, setSelectedSensor] = useState('');

  // Error state
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset previous errors
    setError(null);

    // Trimmed inputs for accurate validation
    const trimmedRoomId = roomId.trim();

    // Validation: Ensure required fields are filled
    if (
      trimmedRoomId === '' ||
      roomWidth === '' ||
      roomLength === '' ||
      maxTemp === '' ||
      minTemp === '' ||
      selectedSensor === ''
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validation: Ensure roomWidth and roomLength are greater than 0
    if (parseFloat(roomWidth) <= 0 || parseFloat(roomLength) <= 0) {
      setError('Value must be greater than 0.');
      return;
    }

    // Validation: Ensure maxTemp >= minTemp
    if (parseFloat(maxTemp) < parseFloat(minTemp)) {
      setError('Max Temperature cannot be lower than Min Temperature.');
      return;
    }

    // Validation: Ensure roomId is unique
    const isDuplicateRoom = rooms.some(
      (room) => room.roomId.toLowerCase() === trimmedRoomId.toLowerCase()
    );
    if (isDuplicateRoom) {
      setError('Room ID already exists. Please choose a different name.');
      return;
    }

    // Validation: Check if the selected sensor is already in use
    const isSensorInUse = rooms.some(
      (room) => room.sensorId === selectedSensor
    );

    if (isSensorInUse) {
      const confirmProceed = window.confirm(
        'The selected sensor is already assigned to another room. Do you want to continue and assign it to this room as well?'
      );

      if (!confirmProceed) {
        // User chose not to proceed
        return;
      }
    }

    // Find the selected sensor data from homeAssistantSensors
    const selectedSensorData = homeAssistantSensors.find(
      (sensor) => sensor.entity_id === selectedSensor
    );

    // Add room with sensor state information and selected material
    addRoom({
      roomId: trimmedRoomId,
      roomWidth: parseFloat(roomWidth),
      roomLength: parseFloat(roomLength),
      maxTemp: parseFloat(maxTemp),
      minTemp: parseFloat(minTemp),
      sensorId: selectedSensor, // Add the sensor ID
      sensorState: selectedSensorData?.state || 'N/A', // Add the sensor's state
      sensorUnit: selectedSensorData?.attributes?.unit_of_measurement || '°C', // Set default unit to °C
    });

    // Reset form
    setRoomId('');
    setRoomWidth('');
    setRoomLength('');
    setMaxTemp(25);
    setMinTemp(15);
    setSelectedSensor(''); // Reset sensor selection

    // Optionally, you can clear the error if needed
    setError(null);
  };

  return (
    <div className="device-form">
      <h3>Add a New Room</h3>

      {/* Display error message if any */}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="roomId">Room ID:</label>
          <input
            type="text"
            id="roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="roomWidth">Room Width (m):</label>
          <input
            type="number"
            id="roomWidth"
            value={roomWidth}
            onChange={(e) => setRoomWidth(e.target.value)}
            placeholder="Enter Room Width in meters"
            required
            min="0.1"
            step="0.1"
          />
        </div>
        <div className="input-group">
          <label htmlFor="roomLength">Room Length (m):</label>
          <input
            type="number"
            id="roomLength"
            value={roomLength}
            onChange={(e) => setRoomLength(e.target.value)}
            placeholder="Enter Room Length in meters"
            required
            min="0.1"
            step="0.1"
          />
        </div>
        <div className="input-group">
          <label htmlFor="maxTemp">Max Temp (°C):</label>
          <input
            type="number"
            id="maxTemp"
            value={maxTemp}
            onChange={(e) => setMaxTemp(e.target.value)}
            placeholder="Enter Max Temperature in Celsius"
            required
            min="-50" // Assuming reasonable temperature ranges
            step="0.1"
          />
        </div>
        <div className="input-group">
          <label htmlFor="minTemp">Min Temp (°C):</label>
          <input
            type="number"
            id="minTemp"
            value={minTemp}
            onChange={(e) => setMinTemp(e.target.value)}
            placeholder="Enter Min Temperature in Celsius"
            required
            min="-50" // Assuming reasonable temperature ranges
            step="0.1"
          />
        </div>

        {/* Dropdown for Home Assistant Sensors */}
        <div className="input-group">
          <label htmlFor="sensorSelect">Select Sensor:</label>
          <select
            id="sensorSelect"
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value)}
            required
          >
            <option value="">Select a sensor</option>
            {homeAssistantSensors.map((sensor) => (
              <option key={sensor.entity_id} value={sensor.entity_id}>
                {sensor.attributes.friendly_name || sensor.entity_id}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Add Room</button>
      </form>
    </div>
  );
}

export default FormRoom;
