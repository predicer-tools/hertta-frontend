import React, { useState, useEffect } from 'react';
import FormRoom from '../forms/FormRoom';
import styles from './InputData.module.css';

function InputData() {
  const [rooms, setRooms] = useState([]);

  // Load rooms from localStorage on component mount
  useEffect(() => {
    const storedRooms = JSON.parse(localStorage.getItem('rooms')) || [];
    setRooms(storedRooms);
  }, []);

  // Function to add a new room and save it to localStorage
  const addRoom = (newRoom) => {
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));
  };

  return (
    <div className={styles.inputDataContainer}>
      <h1>Input Data</h1>
      <div className={styles.formsContainer}>
        <FormRoom addRoom={addRoom} homeAssistantSensors={[]} />
      </div>
      <div className={styles.existingRooms}>
        <h3>Existing Rooms</h3>
        {rooms.length === 0 ? (
          <p>No rooms added yet.</p>
        ) : (
          <ul>
            {rooms.map((room) => (
              <li key={room.roomId}>
                {room.roomId} - {room.roomWidth}m x {room.roomLength}m
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default InputData;
