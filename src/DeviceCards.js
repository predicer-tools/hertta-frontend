import React from 'react';
import './DeviceCards.css';
import { controlElectricHeater } from './ElectricHeaterControl'; // Import control function

function DeviceCards({ electricHeaters, rooms, activeDevices, toggleDeviceStatus, apiKey }) {
  
  // Toggle the electric heater on/off based on its current status
  const handleToggleHeater = (heaterId, isChecked) => {
    const action = isChecked ? 'turn_on' : 'turn_off'; // Turn on if checked, turn off if unchecked
    controlElectricHeater(heaterId, action, apiKey); // Control the heater
    toggleDeviceStatus(heaterId); // Update the local state to reflect the toggle
  };

  // Toggle the room sensor on/off
  const handleToggleRoom = (sensorId, isChecked) => {
    toggleDeviceStatus(sensorId); // Update local state for room sensors
  };

  return (
    <div className="device-cards">
      <h2>Device Cards</h2>
      <div className="cards-container">
        {/* Electric Heater Cards */}
        {electricHeaters.map((heater) => (
          <div key={heater.id} className="device-card">
            <h3>Heater ID: {heater.id}</h3>
            <p>Capacity: {heater.capacity} kW</p>
            <p>Room ID: {heater.roomId}</p>
            <label>
              <input
                type="checkbox"
                checked={activeDevices[heater.id]} // Reflect the current status
                onChange={(e) => handleToggleHeater(heater.id, e.target.checked)} // Handle toggle
              />
              On/Off
            </label>
            <p>Status: {activeDevices[heater.id] ? 'On' : 'Off'}</p>
          </div>
        ))}

        {/* Room Sensor Cards */}
        {rooms.map((room) => (
          <div key={room.sensorId} className="device-card">
            <h3>Room ID: {room.roomId}</h3>
            <p>Room Width: {room.roomWidth}m</p>
            <p>Room Length: {room.roomLength}m</p>
            <p>Max Temp: {(room.maxTemp - 273.15).toFixed(2)}°C</p>
            <p>Min Temp: {(room.minTemp - 273.15).toFixed(2)}°C</p>
            <p>Sensor ID: {room.sensorId}</p>
            <label>
              <input
                type="checkbox"
                checked={activeDevices[room.sensorId]} // Reflect the current status
                onChange={(e) => handleToggleRoom(room.sensorId, e.target.checked)} // Handle toggle
              />
              On/Off
            </label>
            <p>Status: {activeDevices[room.sensorId] ? 'On' : 'Off'}</p>
            <p>Current Temperature: {room.sensorState} {room.sensorUnit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeviceCards;
