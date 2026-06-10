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
  const [outsideWalls, setOutsideWalls] = useState(room.outsideWalls ?? {
    widthWall1: true,
    widthWall2: true,
    lengthWall1: true,
    lengthWall2: true,
  });
  const [ceilingToOutside, setCeilingToOutside] = useState(room.ceilingToOutside ?? true);
  const [floorToSoil, setFloorToSoil] = useState(room.floorToSoil ?? true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      outsideWalls,
      ceilingToOutside,
      floorToSoil,
    };

    try {
      setSaving(true);
      const updated = await updateRoom(updatedRoomData);
      if (updated) onClose();
    } catch (updateError) {
      setError(`Could not update Hertta model: ${updateError.message}`);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className={styles.editRoomForm}>
      <h2>Edit Room</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className={styles.errorMessage}>{error}</p>}

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

        <fieldset className={styles.boundarySettings}>
          <legend>Outside Walls</legend>
          {[
            ['widthWall1', 'Width wall 1'],
            ['widthWall2', 'Width wall 2'],
            ['lengthWall1', 'Length wall 1'],
            ['lengthWall2', 'Length wall 2'],
          ].map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={outsideWalls[key]}
                onChange={(event) =>
                  setOutsideWalls((walls) => ({ ...walls, [key]: event.target.checked }))
                }
              />
              {label}
            </label>
          ))}
        </fieldset>

        <div className={styles.boundarySettings}>
          <label>
            <input
              type="checkbox"
              checked={ceilingToOutside}
              onChange={(event) => setCeilingToOutside(event.target.checked)}
            />
            Ceiling connected to outside
          </label>
          <label>
            <input
              type="checkbox"
              checked={floorToSoil}
              onChange={(event) => setFloorToSoil(event.target.checked)}
            />
            Floor connected to soil
          </label>
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
          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={onClose} className={styles.cancelButton} disabled={saving}>
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
    outsideWalls: PropTypes.object,
    ceilingToOutside: PropTypes.bool,
    floorToSoil: PropTypes.bool,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditRoomForm;
