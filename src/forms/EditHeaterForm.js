// src/forms/EditHeaterForm.js

import React, { useState, useContext } from 'react';
import styles from './EditHeaterForm.module.css'; // Ensure this CSS module exists
import DataContext from '../context/DataContext'; // Import DataContext

/**
 * EditHeaterForm Component
 *
 * @param {Object} props
 * @param {Object} props.heater - The heater object to edit
 * @param {Function} props.onClose - Function to close the modal after editing
 */
function EditHeaterForm({ heater, onClose }) {
  console.log("EditHeaterForm Props:", { heater, onClose }); // Debugging

  const { updateHeater, rooms, controlSignals, optimizeStarted } = useContext(DataContext); // Access updateHeater, rooms, controlSignals, optimizeStarted from DataContext

  // Local state for form inputs
  const [name, setName] = useState(heater.name);
  const [capacity, setCapacity] = useState(heater.capacity);
  const [roomId, setRoomId] = useState(heater.roomId);
  const [isEnabled, setIsEnabled] = useState(heater.isEnabled);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Access control signals for this heater
  const heaterControlSignals = controlSignals[heater.id] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Ensure required fields are filled
    if (name.trim() === '' || capacity === '' || roomId === '') {
      alert('Please fill in all required fields.');
      return;
    }

    // Additional Validation: capacity should be positive
    if (parseFloat(capacity) <= 0) {
      alert('Capacity must be a positive number.');
      return;
    }

    // Update heater with new details
    try {
      setSaving(true);
      const isUpdated = await updateHeater({
        id: heater.id,
        name: name.trim(),
        capacity: parseFloat(capacity),
        roomId,
        isEnabled,
      });
      if (!isUpdated) {
        setError('Failed to update heater.');
        return;
      }
    } catch (updateError) {
      setError(`Could not save Hertta model: ${updateError.message}`);
      return;
    } finally {
      setSaving(false);
    }

    // Close the modal
    onClose();
  };

  return (
    <div className={styles.editHeaterForm}>
      <h2>Edit Heating Device</h2>
      <form onSubmit={handleSubmit}>
        {error && <p>{error}</p>}
        {/* Heater ID (Read-Only) */}
        <div className={styles.inputGroup}>
          <label>Heater ID:</label>
          <input
            type="text"
            value={heater.id}
            disabled // Heater ID should not be editable
          />
        </div>

        {/* Heater Name */}
        <div className={styles.inputGroup}>
          <label>Heater Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Heater Name"
            required
          />
        </div>

        {/* Capacity */}
        <div className={styles.inputGroup}>
          <label>Capacity (kW):</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Enter Capacity in kW"
            required
            min="0.1"
            step="0.1"
          />
        </div>

        {/* Room Selection */}
        <div className={styles.inputGroup}>
          <label>Room:</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          >
            <option value="">Select a Room</option>
            {rooms.map((room) => (
              <option key={room.roomId} value={room.roomId}>
                {room.roomId}
              </option>
            ))}
          </select>
        </div>

        {/* Enabled Toggle */}
        <div className={styles.inputGroup}>
          <label>Enabled:</label>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
        </div>

        {/* Control Signals Display */}
        <div className={styles.controlSignals}>
          <h3>Control Signals</h3>
          {optimizeStarted ? (
            heaterControlSignals.length > 0 ? (
              <ul>
                {heaterControlSignals.map((signal, index) => (
                  <li key={index}>Hour {index + 1}: {signal}</li>
                ))}
              </ul>
            ) : (
              <p>No control signals generated for this heater yet.</p>
            )
          ) : (
            <p>Start optimization to get control signals.</p>
          )}
        </div>

        {/* Buttons */}
        <div className={styles.buttonGroup}>
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" onClick={onClose} className={styles.cancelButton} disabled={saving}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditHeaterForm;
