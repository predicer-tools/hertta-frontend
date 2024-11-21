// src/DataTable.js

import React from 'react';
import './DataTable.css';

function DataTable({ rooms, homeAssistantSensors, fetchedDevices, deleteHeater, deleteRoom }) {
  return (
    <div>
      <h2>Data Table</h2>

      {/* Display Home Assistant Sensors */}
      <h3>Home Assistant Sensors</h3>
      <table>
        <thead>
          <tr>
            <th>Sensor ID</th>
            <th>State</th>
            <th>Friendly Name</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {homeAssistantSensors.length > 0 ? (
            homeAssistantSensors.map((sensor, index) => (
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

      {/* Display Fetched Devices */}
      <h3>Other Devices</h3>
      <table>
        <thead>
          <tr>
            <th>Device ID</th>
            <th>State</th>
            <th>Friendly Name</th>
            <th>Domain</th>
          </tr>
        </thead>
        <tbody>
          {fetchedDevices.length > 0 ? (
            fetchedDevices.map((device, index) => (
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

      {/* Electric Heaters */}
      <h3>Electric Heaters</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Capacity</th>
            <th>Room ID</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rooms.length > 0 ? (
            rooms.flatMap((room) =>
              room.devices.map((heater) => (
                <tr key={heater.id}>
                  <td>{heater.id}</td>
                  <td>{heater.capacity}</td>
                  <td>{room.roomId}</td>
                  <td>
                    <button onClick={() => deleteHeater(heater.id, room.roomId)}>Delete</button>
                  </td>
                </tr>
              ))
            )
          ) : (
            <tr>
              <td colSpan="4">No electric heaters available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Rooms */}
      <h3>Rooms</h3>
      <table>
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
                <td>{room.sensorState} {room.sensorUnit}</td>
                <td>
                  <button onClick={() => deleteRoom(room.sensorId)}>Delete</button>
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
  );
}

export default DataTable;
