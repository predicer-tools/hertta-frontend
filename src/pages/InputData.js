import React, { useState, useEffect } from 'react';
import FormRoom from '../forms/FormRoom';
import FormElectricHeater from '../forms/FormElectricHeater'; // Import the new form
import DataTable from './DataTable'; // Import DataTable
import styles from './InputData.module.css';

function InputData() {
  const [rooms, setRooms] = useState([]);
  const [heaters, setHeaters] = useState([]);

  // Load rooms and heaters from localStorage on component mount
  useEffect(() => {
    const storedRooms = JSON.parse(localStorage.getItem('rooms')) || [];
    const storedHeaters = JSON.parse(localStorage.getItem('heaters')) || [];
    setRooms(storedRooms);
    setHeaters(storedHeaters);
  }, []);

  // Function to add a new room and save it to localStorage
  const addRoom = (newRoom) => {
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));
  };

  // Function to delete a room
  const deleteRoom = (roomId) => {
    const updatedRooms = rooms.filter((room) => room.roomId !== roomId);
    setRooms(updatedRooms);
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));
  };

  // Function to add a new heater and save it to localStorage
  const addElectricHeater = (newHeater) => {
    const updatedHeaters = [...heaters, newHeater];
    setHeaters(updatedHeaters);
    localStorage.setItem('heaters', JSON.stringify(updatedHeaters));
  };

  // Function to delete a heater
  const deleteHeater = (heaterId) => {
    const updatedHeaters = heaters.filter((heater) => heater.id !== heaterId);
    setHeaters(updatedHeaters);
    localStorage.setItem('heaters', JSON.stringify(updatedHeaters));
  };

  return (
    <div className={styles.inputDataContainer}>
      <h1>Input Data</h1>
      <div className={styles.formsContainer}>
        <FormRoom
          addRoom={addRoom}
          homeAssistantSensors={JSON.parse(localStorage.getItem('homeAssistantSensors')) || []}
        />
        <FormElectricHeater
          addElectricHeater={addElectricHeater}
          rooms={rooms} // Pass added rooms to heater form
          fetchedDevices={JSON.parse(localStorage.getItem('fetchedDevices')) || []}
        />
      </div>
      <div className={styles.dataTableContainer}>
        <DataTable
          rooms={rooms}
          deleteRoom={deleteRoom}
          heaters={heaters}
          deleteHeater={deleteHeater}
        />
      </div>
    </div>
  );
}

export default InputData;
