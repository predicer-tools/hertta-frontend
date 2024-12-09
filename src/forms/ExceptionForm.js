// src/forms/ExceptionForm.js

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ExceptionForm.module.css'; // Ensure proper styling

function ExceptionForm({ daysOfWeek, initialData, onSave, onCancel }) {
  const [days, setDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [minTemp, setMinTemp] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setDays(initialData.days);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setMaxTemp(initialData.maxTemp);
      setMinTemp(initialData.minTemp);
    }
  }, [initialData]);

  const toggleDay = (day) => {
    setDays((prevDays) =>
      prevDays.includes(day) ? prevDays.filter((d) => d !== day) : [...prevDays, day]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (days.length === 0) {
      setError('Please select at least one day.');
      return;
    }
    if (startTime === '' || endTime === '') {
      setError('Please define both start and end times.');
      return;
    }
    if (startTime >= endTime) {
      setError('Start Time must be before End Time.');
      return;
    }
    if (maxTemp === '' || minTemp === '') {
      setError('Please define both Max Temp and Min Temp.');
      return;
    }
    if (parseFloat(maxTemp) < parseFloat(minTemp)) {
      setError('Max Temp cannot be lower than Min Temp.');
      return;
    }

    // All validations passed
    onSave({
      days,
      startTime,
      endTime,
      maxTemp: parseFloat(maxTemp),
      minTemp: parseFloat(minTemp),
    });
  };

  return (
    <div className={styles.exceptionForm}>
      <h4>{initialData ? 'Edit Exception' : 'Add Exception'}</h4>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* Days Selection */}
        <div className={styles.inputGroup}>
          <label>Days:</label>
          <div className={styles.daysCheckboxes}>
            {daysOfWeek.map((day) => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={days.includes(day)}
                  onChange={() => toggleDay(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        {/* Time Range */}
        <div className={styles.inputGroup}>
          <label>Start Time:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>End Time:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        {/* Specific Temperature Limits */}
        <div className={styles.inputGroup}>
          <label>Max Temp (°C):</label>
          <input
            type="number"
            value={maxTemp}
            onChange={(e) => setMaxTemp(e.target.value)}
            placeholder="Enter Max Temperature in Celsius"
            required
            min="-50"
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
            min="-50"
            step="0.1"
          />
        </div>

        {/* Buttons */}
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.saveButton}>
            {initialData ? 'Update' : 'Add'}
          </button>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

ExceptionForm.propTypes = {
  daysOfWeek: PropTypes.arrayOf(PropTypes.string).isRequired,
  initialData: PropTypes.shape({
    days: PropTypes.arrayOf(PropTypes.string),
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    maxTemp: PropTypes.number,
    minTemp: PropTypes.number,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

ExceptionForm.defaultProps = {
  initialData: null,
};

export default ExceptionForm;
