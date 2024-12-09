// src/pages/DataTable.js

import React, { useEffect, useState, useContext } from 'react';
import styles from './DataTable.module.css'; // Import CSS Module
import DataContext from '../context/DataContext'; // Import DataContext
import { Tooltip } from 'react-tooltip'; // Import Tooltip from react-tooltip
import 'react-tooltip/dist/react-tooltip.css'; // Import react-tooltip styles
import Modal from '../components/Modal/Modal'; // Import Modal
import EditHeaterForm from '../forms/EditHeaterForm'; // Import EditHeaterForm
import EditRoomForm from '../forms/EditRoomForm'; // Import EditRoomForm
import useWeatherData from '../hooks/useWeatherData';
import WeatherDataTable from '../components/Table/WeatherDataTable';
import TemperatureCalendar from '../components/TemperatureCalendar';


function DataTable() {
  const [sensors, setSensors] = useState([]);
  const [devices, setDevices] = useState([]);

  const { rooms, heaters, deleteRoom, deleteHeater, controlSignals, fiPrices, fiPricesLoading, fiPricesError  } = useContext(DataContext); // Access rooms and heaters from DataContext

  const location = 'Helsinki'; // Replace with dynamic input if needed
  const { weatherData } = useWeatherData(location);


  // State for Heater Edit Modal
  const [isHeaterModalOpen, setIsHeaterModalOpen] = useState(false);
  const [selectedHeater, setSelectedHeater] = useState(null);

  // State for Room Edit Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);


  // Load sensors and devices from localStorage on mount
  useEffect(() => {
    const storedSensors = JSON.parse(localStorage.getItem('homeAssistantSensors')) || [];
    const storedDevices = JSON.parse(localStorage.getItem('fetchedDevices')) || [];
    setSensors(storedSensors);
    setDevices(storedDevices);
  }, []);

  // Function to format temperature
  const formatTemperature = (temp) => (temp === null || temp === undefined ? 'N/A' : `${temp.toFixed(2)} °C`);

  // Modal handling functions for Heaters
  const openHeaterEditModal = (heater) => {
    setSelectedHeater(heater);
    setIsHeaterModalOpen(true);
  };

  const closeHeaterEditModal = () => {
    setSelectedHeater(null);
    setIsHeaterModalOpen(false);
  };

  // Modal handling functions for Rooms
  const openRoomEditModal = (room) => {
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  };

  const closeRoomEditModal = () => {
    setSelectedRoom(null);
    setIsRoomModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <h2>Data Table</h2>

            {/* Rooms Table */}
            <h3>Rooms</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Room ID</th>
              <th>Room Width (m)</th>
              <th>Room Length (m)</th>
              <th>Max Temp (°C)</th>
              <th>Min Temp (°C)</th>
              <th>Sensor ID</th>
              <th>Sensor State</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length > 0 ? rooms.map((room, index) => (
              <tr key={index}>
                <td>{room.roomId}</td>
                <td>{room.roomWidth}</td>
                <td>{room.roomLength}</td>
                <td>{formatTemperature(room.maxTemp)}</td>
                <td>{formatTemperature(room.minTemp)}</td>
                <td>{room.sensorId}</td>
                <td>
                  {room.sensorState} {room.sensorUnit}
                </td>
                <td>
                  <button className={styles.editButton} onClick={() => openRoomEditModal(room)}>Edit</button>
                  <button className={styles.deleteButton} onClick={() => deleteRoom(room.roomId)}>Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8">No rooms available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    {/* Control Signals Table */}
    <h3>Control Signals</h3>
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Heater ID</th>
            <th>Control Signals (Next 12 Hours)</th>
          </tr>
        </thead>
        <tbody>
          {heaters.length > 0 ? (
            heaters.map((heater) => (
              <tr key={heater.id}>
                <td>{heater.id}</td>
                <td>
                  {controlSignals[heater.id] ? (
                    controlSignals[heater.id].map((signal, index) => (
                      <span key={index}>
                        {index > 0 && ', '}
                        {signal}
                      </span>
                    ))
                  ) : (
                    <span>No Signals</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No control signals available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

      {/* Electricity Prices Table */}
      <h3>Electricity Prices (FI)</h3>
      <div className={styles.tableWrapper}>
        {/* Handle Loading State */}
        {fiPricesLoading && <p>Loading electricity prices...</p>}

        {/* Handle Error State */}
        {fiPricesError && <p>Error: {fiPricesError}</p>}

        {/* Render Table if Data is Available */}
        {!fiPricesLoading && !fiPricesError && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp (Finnish Time)</th>
                <th>Final Price (c/kWh)</th>
              </tr>
            </thead>
            <tbody>
              {fiPrices.length > 0 ? (
                fiPrices.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.timestampLocal}</td>
                    <td>{entry.finalPrice}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No FI electricity price data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div>
      <h1>Weather App</h1>
      <WeatherDataTable weatherData={weatherData} />
    </div>

    <div>
      <h1>Weather App</h1>
      <TemperatureCalendar />
    </div>

      {/* Heating Devices Table */}
      <h3>Heating Devices</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Heater ID</th>
              <th>Name</th>
              <th>Capacity (kW)</th>
              <th>Room</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {heaters.length > 0 ? heaters.map((heater, index) => {
              // Find the associated room's name
              const associatedRoom = rooms.find(room => room.roomId === heater.roomId);
              const roomName = associatedRoom ? associatedRoom.roomId : 'Unassigned';

              return (
                <tr key={index}>
                  <td>{heater.id}</td>
                  <td>{heater.name}</td>
                  <td>{heater.capacity.toFixed(2)} kW</td>
                  <td>{roomName}</td>
                  <td>{heater.isEnabled ? 'Enabled' : 'Disabled'}</td>
                  <td>
                    <button className={styles.editButton} onClick={() => openHeaterEditModal(heater)}>Edit</button>
                    <button className={styles.deleteButton} onClick={() => deleteHeater(heater.id)}>Delete</button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6">No heating devices available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sensors Table */}
      <h3>Home Assistant Sensors</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sensor ID</th>
              <th>State</th>
              <th>Friendly Name</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {sensors.length > 0 ? sensors.map((sensor, index) => (
              <tr key={index}>
                <td>{sensor.entity_id}</td>
                <td>{sensor.state}</td>
                <td>{sensor.attributes?.friendly_name || 'Unknown'}</td>
                <td>{sensor.attributes?.unit_of_measurement || ''}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4">No Home Assistant sensors available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Devices Table */}
      <h3>All Home Assistant Devices</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Device ID</th>
              <th>State</th>
              <th>Friendly Name</th>
              <th>Domain</th>
            </tr>
          </thead>
          <tbody>
            {devices.length > 0 ? devices.map((device, index) => (
              <tr key={index}>
                <td>{device.entity_id}</td>
                <td>{device.state}</td>
                <td>{device.attributes?.friendly_name || 'Unknown'}</td>
                <td>{device.entity_id.split('.')[0]}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4">No other devices available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Heaters Edit Modal */}
      <Modal isOpen={isHeaterModalOpen} onClose={closeHeaterEditModal}>
        {selectedHeater && <EditHeaterForm heater={selectedHeater} onClose={closeHeaterEditModal} />}
      </Modal>

      {/* Rooms Edit Modal */}
      <Modal isOpen={isRoomModalOpen} onClose={closeRoomEditModal}>
        {selectedRoom && <EditRoomForm room={selectedRoom} onClose={closeRoomEditModal} />}
      </Modal>
    </div>
  );
}

export default DataTable;
