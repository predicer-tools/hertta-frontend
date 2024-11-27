// src/pages/DataTable.js

import React, { useEffect, useState, useContext } from 'react';
import styles from './DataTable.module.css'; // Import CSS Module
import WeatherContext from '../context/WeatherContext'; // Import WeatherContext
import DataContext from '../context/DataContext'; // Import DataContext
import { Tooltip } from 'react-tooltip'; // Import Tooltip from react-tooltip
import 'react-tooltip/dist/react-tooltip.css'; // Import react-tooltip styles
import Modal from '../components/Modal/Modal'; // Import Modal
import EditHeaterForm from '../forms/EditHeaterForm'; // Import EditHeaterForm
import EditRoomForm from '../forms/EditRoomForm'; // Import EditRoomForm

function DataTable({ rooms, heaters, deleteRoom, deleteHeater }) {
  const [sensors, setSensors] = useState([]);
  const [devices, setDevices] = useState([]);

  // Consume WeatherContext
  const { weatherData } = useContext(WeatherContext);

  // Consume DataContext for FI Electricity Prices and Control Signals
  const { fiElectricityPrices, loadingFiPrices, errorFiPrices, controlSignals } = useContext(DataContext);

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

  // Function to format Electricity Prices
  const formatPrice = (price) => (price === 'N/A' || price === null || price === undefined ? 'N/A' : `${price.toFixed(2)} snt/kWh`);

  // Function to get control signals for a heater
  const getControlSignals = (heaterId) => (controlSignals?.[heaterId] || Array(12).fill('N/A'));

  // Function to get timestamps for control signals
  const getControlSignalTimestamps = () => (
    fiElectricityPrices?.length > 0
      ? fiElectricityPrices.slice(0, 12).map(entry => new Date(entry.timestamp * 1000).toLocaleString())
      : Array(12).fill('N/A')
  );

  const controlSignalTimestamps = getControlSignalTimestamps();

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
      <h3>Other Devices</h3>
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

      {/* Heaters Table */}
      <h3>Heating Devices</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Capacity (kW)</th>
              <th>Room ID</th>
              <th>Enabled</th>
              <th>Control Signals (Next 12 Hours)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {heaters.length > 0 ? heaters.map((heater, index) => (
              <tr key={index}>
                <td>{heater.id}</td>
                <td>{heater.capacity}</td>
                <td>{heater.roomId}</td>
                <td>{heater.isEnabled ? 'Yes' : 'No'}</td>
                <td>
                  <ul className={styles.controlSignalsList}>
                    {getControlSignals(heater.id).map((signal, sigIndex) => (
                      <li
                        key={sigIndex}
                        className={signal === 'ON' ? styles.on : styles.off}
                        data-tooltip-id={`tooltip-${heater.id}-${sigIndex}`}
                        data-tooltip-content={`Time: ${controlSignalTimestamps[sigIndex]}\nSignal: ${signal}`}
                      >
                        {controlSignalTimestamps[sigIndex] !== 'N/A' ? `${controlSignalTimestamps[sigIndex]}: ${signal}` : 'N/A'}
                      </li>
                    ))}
                  </ul>
                  {/* Initialize Tooltip for each signal */}
                  {getControlSignals(heater.id).map((_, sigIndex) => (
                    <Tooltip key={`tooltip-${heater.id}-${sigIndex}`} id={`tooltip-${heater.id}-${sigIndex}`} place="top" effect="solid" />
                  ))}
                </td>
                <td>
                  <button className={styles.editButton} onClick={() => openHeaterEditModal(heater)}>Edit</button>
                  <button className={styles.deleteButton} onClick={() => deleteHeater(heater.id)}>Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6">No heating devices available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      {/* Weather Data Table */}
      <h3>Outside Temperature</h3>
      <div className={styles.tableWrapper}>
        <table className={`${styles.table} ${styles.weatherTable}`}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Temperature (°C)</th>
            </tr>
          </thead>
          <tbody>
            {weatherData && Array.isArray(weatherData.weather_values) && weatherData.weather_values.length > 0 ? (
              weatherData.weather_values.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.time).toLocaleString()}</td>
                  <td>{formatTemperature(entry.value)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No weather data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Electricity Prices Table */}
      <h3>Electricity Prices (FI)</h3>
      <div className={styles.tableWrapper}>
        {loadingFiPrices ? (
          <p>Loading FI electricity prices...</p>
        ) : errorFiPrices ? (
          <p className={styles.error}>{errorFiPrices}</p>
        ) : fiElectricityPrices.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Price (snt/kWh)</th>
              </tr>
            </thead>
            <tbody>
              {fiElectricityPrices.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.timestamp * 1000).toLocaleString()}</td>
                  <td>{formatPrice(entry.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No FI electricity price data available.</p>
        )}
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
