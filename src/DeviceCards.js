import React from 'react'; // Removed useEffect and useState since they're not used
import './DeviceCards.css';

function DeviceCards({ electricHeaters, rooms, activeDevices, toggleDeviceStatus }) {
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
                checked={activeDevices[heater.id]}
                onChange={() => toggleDeviceStatus(heater.id)}
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
                checked={activeDevices[room.sensorId]}
                onChange={() => toggleDeviceStatus(room.sensorId)}
              />
              On/Off
            </label>
            <p>Status: {activeDevices[room.sensorId] ? 'On' : 'Off'}</p>
            {/* Show the stored sensor state from the room object */}
            <p>Current Temperature: {room.sensorState} {room.sensorUnit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeviceCards;
