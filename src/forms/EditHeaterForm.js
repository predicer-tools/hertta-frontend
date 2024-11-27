// src/forms/EditHeaterForm.js

import React, { useState, useContext } from 'react';
import styles from './EditHeaterForm.module.css'; // Create a corresponding CSS module
import DataContext from '../context/DataContext'; // Import DataContext

/**
 * EditHeaterForm Component
 *
 * @param {Object} props
 * @param {Object} props.heater - The heater object to edit
 * @param {Function} props.onClose - Function to close the modal after editing
 */
function EditHeaterForm({ heater, onClose }) {
  const { updateHeater } = useContext(DataContext); // Access updateHeater from DataContext

  const [capacity, setCapacity] = useState(heater.capacity);
  const [roomId, setRoomId] = useState(heater.roomId);
  const [isEnabled, setIsEnabled] = useState(heater.isEnabled);

  // Assuming controlSignals are managed in DataContext and accessible via heater.id
  const { controlSignals } = useContext(DataContext);
  const heaterControlSignals = controlSignals[heater.id] || [];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: Ensure required fields are filled
    if (capacity !== '' && roomId !== '') {
      // Update heater with new details
      updateHeater({
        id: heater.id,
        capacity: parseFloat(capacity),
        roomId,
        isEnabled,
      });

      // Close the modal
      onClose();
    } else {
      // Handle form validation errors
      alert('Please fill in all required fields.');
    }
  };

  return (
    <div className={styles.editHeaterForm}>
      <h2>Edit Heating Device</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label>Heater ID:</label>
          <input
            type="text"
            value={heater.id}
            disabled // Assuming heater ID should not be editable
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Capacity (kW):</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
            min="0"
            step="0.1"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Room:</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          >
            <option value="">Select a Room</option>
            {JSON.parse(localStorage.getItem('rooms'))?.map((room) => (
              <option key={room.roomId} value={room.roomId}>
                {room.roomId}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>Enabled:</label>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
        </div>

        {/* Display Control Signals */}
        <div className={styles.controlSignals}>
          <h3>Control Signals (Next 12 Hours)</h3>
          {heaterControlSignals.length > 0 ? (
            <ul>
              {heaterControlSignals.map((signal, index) => (
                <li key={index}>
                  Hour {index + 1}: {signal}
                </li>
              ))}
            </ul>
          ) : (
            <p>No control signals available.</p>
          )}
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

export default EditHeaterForm;
