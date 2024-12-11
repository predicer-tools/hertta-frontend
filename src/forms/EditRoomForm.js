// src/forms/EditRoomForm.js

import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import styles from './EditRoomForm.module.css'; // Ensure your CSS module is properly set up
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

  // Form state variables
  const [roomId, setRoomId] = useState(room.roomId);
  const [roomWidth, setRoomWidth] = useState(room.roomWidth);
  const [roomLength, setRoomLength] = useState(room.roomLength);
  const [maxTemp, setMaxTemp] = useState(room.maxTemp);
  const [minTemp, setMinTemp] = useState(room.minTemp);
  const [selectedSensor, setSelectedSensor] = useState(room.sensorId);

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

    // Prepare the data to update
    const updatedRoomData = {
      roomId: trimmedRoomId,
      roomWidth: parseFloat(roomWidth),
      roomLength: parseFloat(roomLength),
      maxTemp: parseFloat(maxTemp),
      minTemp: parseFloat(minTemp),
      sensorId: selectedSensor,
    };

    // Update room with new details
    updateRoom(updatedRoomData);

    // Close the modal
    onClose();
  };


  return (
    <div className={styles.editRoomForm}>
      <h2>Edit Room</h2>
      <form onSubmit={handleSubmit}>
        {/* No error state, so remove error message display */}

        {/* Room ID */}
        <div className={styles.inputGroup}>
          <label htmlFor="roomId">Room ID:</label>
          <input
            type="text"
            id="roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            required
            disabled // Assuming roomId is unique and shouldn't be changed
          />
        </div>

        {/* Room Width */}
        <div className={styles.inputGroup}>
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
        <div className={styles.inputGroup}>
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

        {/* Default Temperature Limits */}
        <div className={styles.inputGroup}>
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

        <div className={styles.inputGroup}>
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
        <div className={styles.inputGroup}>
          <label htmlFor="sensorSelect">Select Sensor:</label>
          <select
            id="sensorSelect"
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

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.saveButton}>
            Save Changes
          </button>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

EditRoomForm.propTypes = {
  room: PropTypes.shape({
    roomId: PropTypes.string.isRequired,
    roomWidth: PropTypes.number.isRequired,
    roomLength: PropTypes.number.isRequired,
    maxTemp: PropTypes.number.isRequired,
    minTemp: PropTypes.number.isRequired,
    sensorId: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditRoomForm;
