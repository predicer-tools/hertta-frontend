// src/forms/EditRoomForm.js

import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import styles from './EditRoomForm.module.css'; // Ensure your CSS module is properly set up
import DataContext from '../context/DataContext'; // Import DataContext
import ExceptionForm from './ExceptionForm'; // Import ExceptionForm
import Modal from '../components/Modal/Modal'; // Import Modal component

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
  
  // Exceptions state
  const [exceptions, setExceptions] = useState(room.exceptions || []);

  // Modal state for adding/editing exceptions
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [currentException, setCurrentException] = useState(null); // Holds exception being edited or null

  // Error state
  const [error, setError] = useState(null);

  // Handler to open the modal for adding a new exception
  const openAddExceptionModal = () => {
    setCurrentException(null); // No current exception, it's a new one
    setIsExceptionModalOpen(true);
  };

  // Handler to open the modal for editing an existing exception
  const openEditExceptionModal = (exception) => {
    setCurrentException(exception);
    setIsExceptionModalOpen(true);
  };

  // Handler to close the exception modal
  const closeExceptionModal = () => {
    setIsExceptionModalOpen(false);
    setCurrentException(null);
  };

  // Handler to add a new exception
  const addException = (newException) => {
    // Ensure that the new exception does not duplicate default temperatures
    if (
      parseFloat(newException.maxTemp) === parseFloat(maxTemp) &&
      parseFloat(newException.minTemp) === parseFloat(minTemp)
    ) {
      setError('Exception cannot have the same Max and Min Temperatures as the room\'s defaults.');
      return;
    }

    setExceptions((prev) => [
      ...prev,
      {
        id: Date.now(), // Unique identifier
        ...newException,
      },
    ]);
  };

  // Handler to update an existing exception
  const updateException = (id, updatedException) => {
    // Ensure that the updated exception does not duplicate default temperatures
    if (
      parseFloat(updatedException.maxTemp) === parseFloat(maxTemp) &&
      parseFloat(updatedException.minTemp) === parseFloat(minTemp)
    ) {
      setError('Exception cannot have the same Max and Min Temperatures as the room\'s defaults.');
      return;
    }

    setExceptions((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...updatedException } : ex))
    );
  };

  // Handler to remove an exception
  const removeException = (id) => {
    setExceptions((prev) => prev.filter((ex) => ex.id !== id));
  };

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
      setError('Room Width and Length must be greater than 0.');
      return;
    }

    // Validation: Ensure maxTemp >= minTemp
    if (parseFloat(maxTemp) < parseFloat(minTemp)) {
      setError('Max Temperature cannot be lower than Min Temperature.');
      return;
    }

    // Validation for exceptions
    for (let i = 0; i < exceptions.length; i++) {
      const ex = exceptions[i];
      if (ex.days.length === 0) {
        setError(`Exception ${i + 1}: Please select at least one day.`);
        return;
      }
      if (ex.startTime === '' || ex.endTime === '') {
        setError(`Exception ${i + 1}: Please define both start and end times.`);
        return;
      }
      if (ex.maxTemp === '' || ex.minTemp === '') {
        setError(`Exception ${i + 1}: Please define both Max Temp and Min Temp.`);
        return;
      }
      if (parseFloat(ex.maxTemp) < parseFloat(ex.minTemp)) {
        setError(`Exception ${i + 1}: Max Temp cannot be lower than Min Temp.`);
        return;
      }
      // Additional validation: Ensure startTime is before endTime
      if (ex.startTime >= ex.endTime) {
        setError(`Exception ${i + 1}: Start Time must be before End Time.`);
        return;
      }
      // Validation: Ensure exception temps do not match defaults
      if (
        parseFloat(ex.maxTemp) === parseFloat(maxTemp) &&
        parseFloat(ex.minTemp) === parseFloat(minTemp)
      ) {
        setError(`Exception ${i + 1}: Max and Min Temperatures cannot match the room's defaults.`);
        return;
      }
    }

    // Prepare the data to update
    const updatedRoomData = {
      roomId: trimmedRoomId,
      roomWidth: parseFloat(roomWidth),
      roomLength: parseFloat(roomLength),
      maxTemp: parseFloat(maxTemp),
      minTemp: parseFloat(minTemp),
      sensorId: selectedSensor,
      exceptions: exceptions.map((ex) => ({
        days: ex.days,
        startTime: ex.startTime,
        endTime: ex.endTime,
        maxTemp: parseFloat(ex.maxTemp),
        minTemp: parseFloat(ex.minTemp),
      })),
    };

    // Update room with new details
    updateRoom(updatedRoomData);

    // Close the modal
    onClose();
  };

  // Days of the week for selection
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className={styles.editRoomForm}>
      <h2>Edit Room</h2>
      <form onSubmit={handleSubmit}>
        {/* Display error message if any */}
        {error && <div className={styles.errorMessage}>{error}</div>}

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

        {/* Exceptions Section */}
        <div className={styles.exceptionsSection}>
          <h4>Temperature Exceptions</h4>
          {exceptions.length === 0 && <p>No exceptions added.</p>}
          {exceptions.map((ex, index) => (
            <div key={ex.id} className={styles.exceptionItem}>
              <h5>Exception {index + 1}</h5>
              {/* Display exception details */}
              <p>
                <strong>Days:</strong> {ex.days.join(', ')}
              </p>
              <p>
                <strong>Time:</strong> {ex.startTime} - {ex.endTime}
              </p>
              <p>
                <strong>Max Temp:</strong> {ex.maxTemp}°C | <strong>Min Temp:</strong> {ex.minTemp}°C
              </p>

              {/* Edit and Remove Buttons */}
              <button
                type="button"
                className={styles.editExceptionButton}
                onClick={() => openEditExceptionModal(ex)}
              >
                Edit
              </button>
              <button
                type="button"
                className={styles.removeExceptionButton}
                onClick={() => removeException(ex.id)}
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add Exception Button */}
          <button type="button" className={styles.addExceptionButton} onClick={openAddExceptionModal}>
            Add Exception
          </button>
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

      {/* Modal for Adding/Editing Exceptions */}
      <Modal isOpen={isExceptionModalOpen} onClose={closeExceptionModal}>
        <ExceptionForm
          daysOfWeek={daysOfWeek}
          initialData={currentException}
          onSave={(data) => {
            if (currentException) {
              // Editing existing exception
              updateException(currentException.id, data);
            } else {
              // Adding new exception
              addException(data);
            }
            closeExceptionModal();
          }}
          onCancel={closeExceptionModal}
        />
      </Modal>
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
    exceptions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        days: PropTypes.arrayOf(PropTypes.string).isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
        maxTemp: PropTypes.number.isRequired,
        minTemp: PropTypes.number.isRequired,
      })
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditRoomForm;
