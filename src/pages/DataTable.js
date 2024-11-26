// src/pages/DataTable.js

import React, { useEffect, useState, useContext } from 'react';
import styles from './DataTable.module.css'; // Import CSS Module
import WeatherContext from '../context/WeatherContext'; // Import WeatherContext
import DataContext from '../context/DataContext'; // Import DataContext

function DataTable({ rooms, heaters, deleteRoom, deleteHeater }) {
  const [sensors, setSensors] = useState([]);
  const [devices, setDevices] = useState([]);

  // Consume WeatherContext
  const { weatherData } = useContext(WeatherContext);

  // Consume DataContext for FI Electricity Prices
  const { fiElectricityPrices, loadingFiPrices, errorFiPrices } = useContext(DataContext);

  // Load sensors and devices from localStorage
  useEffect(() => {
    const storedSensors = JSON.parse(localStorage.getItem('homeAssistantSensors')) || [];
    const storedDevices = JSON.parse(localStorage.getItem('fetchedDevices')) || [];

    setSensors(storedSensors);
    setDevices(storedDevices);
  }, []);

  // Function to format temperature (assuming weatherData.value is in Celsius)
  const formatTemperature = (temp) => {
    if (temp === null || temp === undefined) return 'N/A';
    return `${temp.toFixed(2)} °C`;
  };

  // Function to format Electricity Prices
  const formatPrice = (price) => {
    if (price === 'N/A' || price === null || price === undefined) return 'N/A';
    return `${price.toFixed(2)} €/MWh`;
  };

  return (
    <div className={styles.container}>
      <h2>Data Table</h2>

      {/* Display Home Assistant Sensors */}
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
            {sensors.length > 0 ? (
              sensors.map((sensor, index) => (
                <tr key={index}>
                  <td>{sensor.entity_id}</td>
                  <td>{sensor.state}</td>
                  <td>{sensor.attributes?.friendly_name || 'Unknown'}</td>
                  <td>{sensor.attributes?.unit_of_measurement || ''}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No Home Assistant sensors available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Display Fetched Devices */}
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
            {devices.length > 0 ? (
              devices.map((device, index) => (
                <tr key={index}>
                  <td>{device.entity_id}</td>
                  <td>{device.state}</td>
                  <td>{device.attributes?.friendly_name || 'Unknown'}</td>
                  <td>{device.entity_id.split('.')[0]}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No other devices available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Heating Devices */}
      <h3>Heating Devices</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Capacity (kW)</th>
              <th>Room ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {heaters.length > 0 ? (
              heaters.map((heater, index) => (
                <tr key={index}>
                  <td>{heater.id}</td>
                  <td>{heater.capacity}</td>
                  <td>{heater.roomId}</td>
                  <td>
                    <button
                      className={styles.deleteButton}
                      onClick={() => deleteHeater(heater.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No heating devices available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Rooms */}
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
            {rooms.length > 0 ? (
              rooms.map((room, index) => (
                <tr key={index}>
                  <td>{room.roomId}</td>
                  <td>{room.roomWidth}</td>
                  <td>{room.roomLength}</td>
                  <td>{(room.maxTemp - 273.15).toFixed(2)}</td>
                  <td>{(room.minTemp - 273.15).toFixed(2)}</td>
                  <td>{room.sensorId}</td>
                  <td>
                    {room.sensorState} {room.sensorUnit}
                  </td>
                  <td>
                    <button
                      className={styles.deleteButton}
                      onClick={() => deleteRoom(room.roomId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No rooms available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Display Weather Data */}
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

      {/* Display FI Electricity Prices */}
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
                <th>Price (€/MWh)</th>
              </tr>
            </thead>
            <tbody>
              {fiElectricityPrices.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.timestamp * 1000).toLocaleString()}</td> {/* Convert Unix timestamp to JS Date */}
                  <td>{formatPrice(entry.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No FI electricity price data available.</p>
        )}
      </div>
    </div>
  );
}

export default DataTable;
