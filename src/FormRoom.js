// src/FormRoom.js

import React, { useState } from 'react';
import './DataForm.css'; // Import the updated CSS

function FormRoom({ addRoom, homeAssistantSensors }) {
  const [roomId, setRoomId] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [roomLength, setRoomLength] = useState('');
  const [maxTemp, setMaxTemp] = useState(298.15);
  const [minTemp, setMinTemp] = useState(288.15);
  const [selectedSensor, setSelectedSensor] = useState(''); // State to store selected sensor
  const [selectedMaterial, setSelectedMaterial] = useState(''); // State to store selected material

  // New State: Toggle between API sensor and Test sensor
  const [useTestSensor, setUseTestSensor] = useState(false);
  const [testSensorId, setTestSensorId] = useState(''); // State to store test sensor ID

  // Material data from the image (in kWh/m²K)
  const materials = [
    { name: 'Kevytrakenteinen', value: 40 / 1000 },
    { name: 'Keskiraskas I', value: 70 / 1000 },
    { name: 'Keskiraskas II', value: 110 / 1000 },
    { name: 'Raskasrakenteinen', value: 200 / 1000 },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: Ensure required fields are filled
    if (
      roomId &&
      roomWidth &&
      roomLength &&
      maxTemp &&
      minTemp &&
      selectedMaterial &&
      (selectedSensor || testSensorId)
    ) {
      // Determine which sensor to use
      const sensorToUse = useTestSensor ? testSensorId : selectedSensor;

      // Find the selected sensor data from homeAssistantSensors if not using test sensor
      const selectedSensorData = !useTestSensor
        ? homeAssistantSensors.find((sensor) => sensor.entity_id === selectedSensor)
        : null;

      // Add room with sensor state information and selected material
      addRoom({
        roomId,
        roomWidth: parseFloat(roomWidth),
        roomLength: parseFloat(roomLength),
        maxTemp: parseFloat(maxTemp),
        minTemp: parseFloat(minTemp),
        sensorId: sensorToUse, // Add the sensor ID (either selected or test)
        sensorState: selectedSensorData
          ? selectedSensorData.state
          : useTestSensor
          ? 'Test State'
          : 'N/A', // Add the sensor's state
        sensorUnit: selectedSensorData
          ? selectedSensorData.attributes.unit_of_measurement
          : useTestSensor
          ? '°C'
          : '', // Add sensor unit
        material: selectedMaterial, // Add selected material
      });

      // Reset form
      setRoomId('');
      setRoomWidth('');
      setRoomLength('');
      setMaxTemp(298.15);
      setMinTemp(288.15);
      setSelectedSensor(''); // Reset sensor selection
      setSelectedMaterial(''); // Reset material selection
      setUseTestSensor(false); // Reset toggle
      setTestSensorId(''); // Reset test sensor input
    } else {
      // Optionally, handle form validation errors here
      alert('Please fill in all required fields.');
    }
  };

  return (
    <div className="device-form">
      <div className="input-group">
        <label>Room ID:</label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
        />
      </div>
      <div className="input-group">
        <label>Room Width (m):</label>
        <input
          type="number"
          value={roomWidth}
          onChange={(e) => setRoomWidth(e.target.value)}
          placeholder="Enter Room Width in meters"
        />
      </div>
      <div className="input-group">
        <label>Room Length (m):</label>
        <input
          type="number"
          value={roomLength}
          onChange={(e) => setRoomLength(e.target.value)}
          placeholder="Enter Room Length in meters"
        />
      </div>
      <div className="input-group">
        <label>Max Temp (K):</label>
        <input
          type="number"
          value={maxTemp}
          onChange={(e) => setMaxTemp(e.target.value)}
          placeholder="Enter Max Temperature in Kelvin"
        />
      </div>
      <div className="input-group">
        <label>Min Temp (K):</label>
        <input
          type="number"
          value={minTemp}
          onChange={(e) => setMinTemp(e.target.value)}
          placeholder="Enter Min Temperature in Kelvin"
        />
      </div>

      {/* Toggle Between API Sensor and Test Sensor */}
      <div className="input-group">
        <label>Sensor Source:</label>
        <div className="toggle-group">
          <label>
            <input
              type="radio"
              name="sensorSource"
              value="api"
              checked={!useTestSensor}
              onChange={() => setUseTestSensor(false)}
            />
            API Sensor
          </label>
          <label>
            <input
              type="radio"
              name="sensorSource"
              value="test"
              checked={useTestSensor}
              onChange={() => setUseTestSensor(true)}
            />
            Test Sensor
          </label>
        </div>
      </div>

      {/* Dropdown for Home Assistant Sensors */}
      {!useTestSensor && (
        <div className="input-group">
          <label>Select Sensor:</label>
          <select value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)}>
            <option value="">Select a sensor</option>
            {homeAssistantSensors.map((sensor) => (
              <option key={sensor.entity_id} value={sensor.entity_id}>
                {sensor.attributes.friendly_name || sensor.entity_id}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Input for Test Sensor */}
      {useTestSensor && (
        <div className="input-group">
          <label>Enter Test Sensor ID:</label>
          <input
            type="text"
            value={testSensorId}
            onChange={(e) => setTestSensorId(e.target.value)}
            placeholder="Enter Test Sensor ID"
          />
        </div>
      )}

      {/* Dropdown for selecting material */}
      <div className="input-group">
        <label>Select Material Type:</label>
        <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)}>
          <option value="">Select material type</option>
          {materials.map((material, index) => (
            <option key={index} value={material.value}>
              {material.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" onClick={handleSubmit}>
        Add Room
      </button>
    </div>
  );
}

export default FormRoom;
