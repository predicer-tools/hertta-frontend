// src/forms/FormRoom.js

import React, { useState, useContext } from 'react';
import './DataForm.css'; // Ensure this CSS file is updated accordingly
import DataContext from '../context/DataContext'; // Import DataContext
import Modal from '../components/Modal/Modal'; // Import the Modal component
import ExceptionForm from './ExceptionForm';

function FormRoom({ homeAssistantSensors }) {
  const { addRoom, rooms } = useContext(DataContext); // Access addRoom and existing rooms from DataContext

  // Form state variables
  const [roomId, setRoomId] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [roomLength, setRoomLength] = useState('');
  const [defaultMaxTemp, setDefaultMaxTemp] = useState('');
  const [defaultMinTemp, setDefaultMinTemp] = useState('');
  const [selectedSensor, setSelectedSensor] = useState('');

  // State for exceptions
  const [exceptions, setExceptions] = useState([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentException, setCurrentException] = useState(null); // Holds exception being edited or null

  // Error state
  const [error, setError] = useState(null);

  // Handler to open the modal for adding a new exception
  const openAddExceptionModal = () => {
    setCurrentException(null); // No current exception, it's a new one
    setIsModalOpen(true);
  };

  // Handler to open the modal for editing an existing exception
  const openEditExceptionModal = (exception) => {
    setCurrentException(exception);
    setIsModalOpen(true);
  };

  // Handler to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentException(null);
  };

  // Handler to add a new exception
  const addException = (newException) => {
    // Ensure that the new exception does not duplicate default temperatures
    if (
      parseFloat(newException.maxTemp) === parseFloat(defaultMaxTemp) &&
      parseFloat(newException.minTemp) === parseFloat(defaultMinTemp)
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
      parseFloat(updatedException.maxTemp) === parseFloat(defaultMaxTemp) &&
      parseFloat(updatedException.minTemp) === parseFloat(defaultMinTemp)
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
      defaultMaxTemp === '' ||
      defaultMinTemp === '' ||
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

    // Validation: Ensure defaultMaxTemp >= defaultMinTemp
    if (parseFloat(defaultMaxTemp) < parseFloat(defaultMinTemp)) {
      setError('Default Max Temperature cannot be lower than Default Min Temperature.');
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
        parseFloat(ex.maxTemp) === parseFloat(defaultMaxTemp) &&
        parseFloat(ex.minTemp) === parseFloat(defaultMinTemp)
      ) {
        setError(`Exception ${i + 1}: Max and Min Temperatures cannot match the room's defaults.`);
        return;
      }
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

    // Prepare the data to add
    const roomData = {
      roomId: trimmedRoomId,
      roomWidth: parseFloat(roomWidth),
      roomLength: parseFloat(roomLength),
      defaultMaxTemp: parseFloat(defaultMaxTemp),
      defaultMinTemp: parseFloat(defaultMinTemp),
      sensorId: selectedSensor, // Add the sensor ID
      sensorState: selectedSensorData?.state || 'N/A', // Add the sensor's state
      sensorUnit: selectedSensorData?.attributes?.unit_of_measurement || '°C', // Set default unit to °C
      exceptions: exceptions.map((ex) => ({
        days: ex.days,
        startTime: ex.startTime,
        endTime: ex.endTime,
        maxTemp: parseFloat(ex.maxTemp),
        minTemp: parseFloat(ex.minTemp),
      })),
    };

    // Add room with sensor state information
    const isAdded = addRoom(roomData);

    if (!isAdded) {
      setError('Failed to add room. Please check the console for details.');
      return;
    }

    // Reset form
    setRoomId('');
    setRoomWidth('');
    setRoomLength('');
    setDefaultMaxTemp('');
    setDefaultMinTemp('');
    setSelectedSensor('');
    setExceptions([]);
    setError(null);
  };

  // Days of the week for selection
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="device-form">
      <h3>Add a New Room</h3>

      {/* Display error message if any */}
      {error && <div className="error-message">{error}</div>}

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

        {/* Default Temperature Limits */}
        <div className="input-group">
          <label htmlFor="defaultMaxTemp">Default Max Temp (°C):</label>
          <input
            type="number"
            id="defaultMaxTemp"
            value={defaultMaxTemp}
            onChange={(e) => setDefaultMaxTemp(e.target.value)}
            placeholder="Enter Default Max Temperature in Celsius"
            required
            min="-50" // Assuming reasonable temperature ranges
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label htmlFor="defaultMinTemp">Default Min Temp (°C):</label>
          <input
            type="number"
            id="defaultMinTemp"
            value={defaultMinTemp}
            onChange={(e) => setDefaultMinTemp(e.target.value)}
            placeholder="Enter Default Min Temperature in Celsius"
            required
            min="-50" // Assuming reasonable temperature ranges
            step="0.1"
          />
        </div>

        {/* Exceptions Section */}
        <div className="exceptions-section">
          <h4>Temperature Exceptions</h4>
          {exceptions.length === 0 && <p>No exceptions added.</p>}
          {exceptions.map((ex, index) => (
            <div key={ex.id} className="exception-item">
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
                className="edit-exception-button"
                onClick={() => openEditExceptionModal(ex)}
              >
                Edit
              </button>
              <button
                type="button"
                className="remove-exception-button"
                onClick={() => removeException(ex.id)}
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add Exception Button */}
          <button type="button" className="add-exception-button" onClick={openAddExceptionModal}>
            Add Exception
          </button>
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

      {/* Modal for Adding/Editing Exceptions */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
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
            closeModal();
          }}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}

export default FormRoom;
