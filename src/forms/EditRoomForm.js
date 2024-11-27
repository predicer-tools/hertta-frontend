// src/forms/EditRoomForm.js

import React, { useState, useContext } from 'react';
import styles from './EditRoomForm.module.css'; // Import CSS Module
import DataContext from '../context/DataContext'; // Import DataContext

/**
 * EditRoomForm Component
 *
 * @param {Object} props
 * @param {Object} props.room - The room object to edit
 * @param {Function} props.onClose - Function to close the modal after editing
 */
function EditRoomForm({ room, onClose }) {
  const { updateRoom } = useContext(DataContext); // Access updateRoom from DataContext

  const [roomId, setRoomId] = useState(room.roomId);
  const [roomWidth, setRoomWidth] = useState(room.roomWidth);
  const [roomLength, setRoomLength] = useState(room.roomLength);
  const [maxTemp, setMaxTemp] = useState(room.maxTemp);
  const [minTemp, setMinTemp] = useState(room.minTemp);
  const [selectedSensor, setSelectedSensor] = useState(room.sensorId);
  const [selectedMaterial, setSelectedMaterial] = useState(room.material);

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
      maxTemp !== '' &&
      minTemp !== '' &&
      selectedSensor &&
      selectedMaterial
    ) {
      // Additional Validation: maxTemp >= minTemp
      if (parseFloat(maxTemp) < parseFloat(minTemp)) {
        alert('Max Temperature cannot be lower than Min Temperature.');
        return;
      }

      // Update room with new details
      updateRoom({
        roomId,
        roomWidth: parseFloat(roomWidth),
        roomLength: parseFloat(roomLength),
        maxTemp: parseFloat(maxTemp),
        minTemp: parseFloat(minTemp),
        sensorId: selectedSensor,
        material: selectedMaterial,
      });

      // Close the modal
      onClose();
    } else {
      // Handle form validation errors
      alert('Please fill in all required fields.');
    }
  };

  return (
    <div className={styles.editRoomForm}>
      <h2>Edit Room</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label>Room ID:</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            required
            disabled // Assuming roomId is unique and shouldn't be changed
          />
        </div>
        <div className={styles.inputGroup}>
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
        <div className={styles.inputGroup}>
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
        <div className={styles.inputGroup}>
          <label>Max Temp (°C):</label>
          <input
            type="number"
            value={maxTemp}
            onChange={(e) => setMaxTemp(e.target.value)}
            placeholder="Enter Max Temperature in Celsius"
            required
            min="-50" // Assuming reasonable temperature ranges
            step="0.1"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Min Temp (°C):</label>
          <input
            type="number"
            value={minTemp}
            onChange={(e) => setMinTemp(e.target.value)}
            placeholder="Enter Min Temperature in Celsius"
            required
            min="-50" // Assuming reasonable temperature ranges
            step="0.1"
          />
        </div>

        {/* Dropdown for Home Assistant Sensors */}
        <div className={styles.inputGroup}>
          <label>Select Sensor:</label>
          <select
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value)}
            required
          >
            <option value="">Select a sensor</option>
            {JSON.parse(localStorage.getItem('homeAssistantSensors'))?.map((sensor) => (
              <option key={sensor.entity_id} value={sensor.entity_id}>
                {sensor.attributes.friendly_name || sensor.entity_id}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown for selecting material */}
        <div className={styles.inputGroup}>
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

        <div className={styles.buttonGroup}>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditRoomForm;
