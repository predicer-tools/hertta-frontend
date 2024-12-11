// src/forms/FormRoom.js

import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import './DataForm.css'; // Ensure this CSS file is updated accordingly
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

  const handleSubmit = (e) => {
    e.preventDefault();

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
      alert('Please fill in all required fields.');
      return;
    }

    // Validation: Ensure roomWidth and roomLength are greater than 0
    if (parseFloat(roomWidth) <= 0 || parseFloat(roomLength) <= 0) {
      alert('Room Width and Length must be greater than 0.');
      return;
    }

    // Validation: Ensure maxTemp >= minTemp
    if (parseFloat(maxTemp) < parseFloat(minTemp)) {
      alert('Max Temperature cannot be lower than Min Temperature.');
      return;
    }

    // Validation: Ensure roomId is unique
    const isDuplicateRoom = rooms.some(
      (room) => room.roomId.toLowerCase() === trimmedRoomId.toLowerCase()
    );
    if (isDuplicateRoom) {
      alert('Room ID already exists. Please choose a different name.');
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

    // Prepare the data to add
    const roomData = {
      roomId: trimmedRoomId,
      roomWidth: parseFloat(roomWidth),
      roomLength: parseFloat(roomLength),
      maxTemp: parseFloat(maxTemp),
      minTemp: parseFloat(minTemp),
      sensorId: selectedSensor, // Add the sensor ID
      sensorState: selectedSensorData?.state || 'N/A', // Add the sensor's state
      sensorUnit: selectedSensorData?.attributes?.unit_of_measurement || '°C', // Set default unit to °C
    };

    // Add room with sensor state information
    const isAdded = addRoom(roomData);

    if (!isAdded) {
      alert('Failed to add room. Please check the console for details.');
      return;
    }

    // Reset form
    setRoomId('');
    setRoomWidth('');
    setRoomLength('');
    setMaxTemp('');
    setMinTemp('');
    setSelectedSensor('');
  };

  return (
    <div className="device-form">
      <h3>Add a New Room</h3>

      {/* No error state, so remove error message display */}

      <form onSubmit={handleSubmit}>
        {/* Room ID */}
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

        {/* Room Width */}
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

        {/* Room Length */}
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

        {/* Temperature Limits */}
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

FormRoom.propTypes = {
  homeAssistantSensors: PropTypes.arrayOf(
    PropTypes.shape({
      entity_id: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      attributes: PropTypes.shape({
        friendly_name: PropTypes.string,
        unit_of_measurement: PropTypes.string,
      }),
    })
  ).isRequired,
};

export default FormRoom;
