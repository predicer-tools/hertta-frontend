import React, { useState } from 'react';
import './DataForm.css'; // Import the updated CSS

function FormRoom({ addRoom, homeAssistantSensors }) {
  const [roomId, setRoomId] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [roomLength, setRoomLength] = useState('');
  const [maxTemp, setMaxTemp] = useState(298.15); // Default: 25°C
  const [minTemp, setMinTemp] = useState(288.15); // Default: 15°C
  const [selectedSensor, setSelectedSensor] = useState(''); // State to store selected sensor
  const [selectedMaterial, setSelectedMaterial] = useState(''); // State to store selected material

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
    if (roomId && roomWidth && roomLength && maxTemp && minTemp && selectedMaterial && selectedSensor) {
      // Find the selected sensor data from homeAssistantSensors
      const selectedSensorData = homeAssistantSensors.find((sensor) => sensor.entity_id === selectedSensor);

      // Add room with sensor state information and selected material
      addRoom({
        roomId,
        roomWidth: parseFloat(roomWidth),
        roomLength: parseFloat(roomLength),
        maxTemp: parseFloat(maxTemp),
        minTemp: parseFloat(minTemp),
        sensorId: selectedSensor, // Add the sensor ID
        sensorState: selectedSensorData?.state || 'N/A', // Add the sensor's state
        sensorUnit: selectedSensorData?.attributes?.unit_of_measurement || '', // Add sensor unit
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
    } else {
      // Optionally, handle form validation errors here
      alert('Please fill in all required fields.');
    }
  };

  return (
    <div className="device-form">
      <h3>Add a New Room</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Room ID:</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            required
          />
        </div>
        <div className="input-group">
          <label>Room Width (m):</label>
          <input
            type="number"
            value={roomWidth}
            onChange={(e) => setRoomWidth(e.target.value)}
            placeholder="Enter Room Width in meters"
            required
            min="0"
            step="0.1"
          />
        </div>
        <div className="input-group">
          <label>Room Length (m):</label>
          <input
            type="number"
            value={roomLength}
            onChange={(e) => setRoomLength(e.target.value)}
            placeholder="Enter Room Length in meters"
            required
            min="0"
            step="0.1"
          />
        </div>
        <div className="input-group">
          <label>Max Temp (K):</label>
          <input
            type="number"
            value={maxTemp}
            onChange={(e) => setMaxTemp(e.target.value)}
            placeholder="Enter Max Temperature in Kelvin"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="input-group">
          <label>Min Temp (K):</label>
          <input
            type="number"
            value={minTemp}
            onChange={(e) => setMinTemp(e.target.value)}
            placeholder="Enter Min Temperature in Kelvin"
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Dropdown for Home Assistant Sensors */}
        <div className="input-group">
          <label>Select Sensor:</label>
          <select
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

        {/* Dropdown for selecting material */}
        <div className="input-group">
          <label>Select Material Type:</label>
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            required
          >
            <option value="">Select material type</option>
            {materials.map((material, index) => (
              <option key={index} value={material.value}>
                {material.name}
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