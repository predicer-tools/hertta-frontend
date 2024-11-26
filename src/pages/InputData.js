// src/pages/InputData.js

import React, { useContext } from 'react';
import FormRoom from '../forms/FormRoom';
import FormElectricHeater from '../forms/FormElectricHeater'; // Import the new form
import DataTable from './DataTable'; // Import DataTable
import styles from './InputData.module.css';
import DataContext from '../context/DataContext'; // Import DataContext
import ConfigContext from '../context/ConfigContext'; // Import ConfigContext

function InputData() {
  const { rooms, heaters, addRoom, deleteRoom, addElectricHeater, deleteHeater } = useContext(DataContext);
  const { devices } = useContext(ConfigContext); // Access devices from ConfigContext

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
          fetchedDevices={devices} // Pass devices from ConfigContext
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
