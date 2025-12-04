// src/pages/InputData.js

import React, { useContext, useState } from 'react';
import FormRoom from '../forms/FormRoom';
import FormElectricHeater from '../forms/FormElectricHeater'; // Import the new form
import DataTable from './DataTable'; // Import DataTable
import Modal from '../components/Modal/Modal'; // Import Modal
import styles from './InputData.module.css'; // Import the CSS module
import DataContext from '../context/DataContext'; // Import DataContext
import ConfigContext from '../context/ConfigContext'; // Import ConfigContext

function InputData() {
  const { rooms, heaters, addRoom, deleteRoom, addElectricHeater, deleteHeater } = useContext(DataContext);
  const { devices } = useContext(ConfigContext); // Access devices from ConfigContext

  // State to control Room Modal visibility
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  // State to control Heating Device Modal visibility
  const [isHeaterModalOpen, setIsHeaterModalOpen] = useState(false);

  // Functions to open modals
  const openRoomModal = () => {
    setIsRoomModalOpen(true);
  };

  const openHeaterModal = () => {
    setIsHeaterModalOpen(true);
  };

  // Functions to close modals
  const closeRoomModal = () => {
    setIsRoomModalOpen(false);
  };

  const closeHeaterModal = () => {
    setIsHeaterModalOpen(false);
  };

  return (
    <div className={styles.inputDataContainer}>
      <h1>Input Data</h1>
      
      {/* Buttons to Open Modals */}
      <div className={styles.buttonsContainer}>
        <button 
          className={`${styles.addButton} button-group button`} 
          onClick={openRoomModal}
        >
          + Add Room
        </button>
        <button 
          className={`${styles.addButton} button-group button`} 
          onClick={openHeaterModal}
        >
          + Add Heating Device
        </button>
      </div>

      {/* Modal for Adding Room */}
      <Modal isOpen={isRoomModalOpen} onClose={closeRoomModal}>
        <FormRoom
          addRoom={addRoom}
          homeAssistantSensors={JSON.parse(localStorage.getItem('homeAssistantSensors')) || []}
          onClose={closeRoomModal} // Pass onClose to reset the modal after submission
        />
      </Modal>

      {/* Modal for Adding Heating Device */}
      <Modal isOpen={isHeaterModalOpen} onClose={closeHeaterModal}>
        <FormElectricHeater
          addElectricHeater={addElectricHeater}
          rooms={rooms} // Pass added rooms to heater form
          fetchedDevices={devices} // Pass devices from ConfigContext
          onClose={closeHeaterModal} // Pass onClose to reset the modal after submission
        />
      </Modal>

      {/* Data Table */}
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
