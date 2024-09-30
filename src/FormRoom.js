import React, { useState } from 'react';
import './DataForm.css'; // Import the updated CSS

function FormRoom({ addRoom, homeAssistantSensors }) {
  const [roomId, setRoomId] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [roomLength, setRoomLength] = useState('');
  const [maxTemp, setMaxTemp] = useState(298.15);
  const [minTemp, setMinTemp] = useState(288.15);
  const [selectedSensor, setSelectedSensor] = useState(''); // State to store selected sensor

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId && roomWidth && roomLength && maxTemp && minTemp && selectedSensor) {
      // Find the selected sensor data from homeAssistantSensors
      const selectedSensorData = homeAssistantSensors.find(sensor => sensor.entity_id === selectedSensor);

      // Add room with sensor state information
      addRoom({
        roomId,
        roomWidth: parseFloat(roomWidth),
        roomLength: parseFloat(roomLength),
        maxTemp: parseFloat(maxTemp),
        minTemp: parseFloat(minTemp),
        sensorId: selectedSensor, // Add the selected sensor ID to the room data
        sensorState: selectedSensorData ? selectedSensorData.state : 'N/A', // Add the sensor's state
        sensorUnit: selectedSensorData ? selectedSensorData.attributes.unit_of_measurement : '', // Add sensor unit
      });

      // Reset form
      setRoomId('');
      setRoomWidth('');
      setRoomLength('');
      setMaxTemp(298.15);
      setMinTemp(288.15);
      setSelectedSensor(''); // Reset sensor selection
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
        />
      </div>
      <div className="input-group">
        <label>Room Width (m):</label>
        <input
          type="number"
          value={roomWidth}
          onChange={(e) => setRoomWidth(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Room Length (m):</label>
        <input
          type="number"
          value={roomLength}
          onChange={(e) => setRoomLength(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Max Temp (K):</label>
        <input
          type="number"
          value={maxTemp}
          onChange={(e) => setMaxTemp(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Min Temp (K):</label>
        <input
          type="number"
          value={minTemp}
          onChange={(e) => setMinTemp(e.target.value)}
        />
      </div>

      {/* Dropdown for Home Assistant Sensors */}
      <div className="input-group">
        <label>Select Sensor:</label>
        <select
          value={selectedSensor}
          onChange={(e) => setSelectedSensor(e.target.value)}
        >
          <option value="">Select a sensor</option>
          {homeAssistantSensors.map((sensor) => (
            <option key={sensor.entity_id} value={sensor.entity_id}>
              {sensor.attributes.friendly_name || sensor.entity_id}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" onClick={handleSubmit}>Add Room</button>
    </div>
  );
}

export default FormRoom;
