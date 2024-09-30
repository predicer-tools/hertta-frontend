// src/InputRoom.js

import React, { useState } from 'react';

const materialProperties = {
  "Stone Wall": 0.025,
  // Add more materials here as needed
};

function InputRoom({ addInteriorAirSensor }) {
  const [sensorId, setSensorId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [roomLength, setRoomLength] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [minTemp, setMinTemp] = useState('');
  const [material, setMaterial] = useState('Stone Wall');

  const handleSubmit = (e) => {
    e.preventDefault();

    const floorArea = parseFloat(roomWidth) * parseFloat(roomLength);
    const specCapEnv = materialProperties[material];
    const t_e_conversion_env = floorArea * specCapEnv;
    const specCapInt = 0.00278; // Constant value for internal specific heat capacity
    const t_e_conversion_int = floorArea * specCapInt;

    const maxTempK = parseFloat(maxTemp) + 273.15;
    const minTempK = parseFloat(minTemp) + 273.15;

    addInteriorAirSensor({
      sensorId,
      roomId,
      roomWidth,
      roomLength,
      maxTemp: maxTempK,
      minTemp: minTempK,
      t_e_conversion_env,
      t_e_conversion_int
    });

    setSensorId('');
    setRoomId('');
    setRoomWidth('');
    setRoomLength('');
    setMaxTemp('');
    setMinTemp('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Sensor ID:</label>
        <input
          type="text"
          value={sensorId}
          onChange={(e) => setSensorId(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>Room ID:</label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>Room Width (m):</label>
        <input
          type="number"
          step="0.01"
          value={roomWidth}
          onChange={(e) => setRoomWidth(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>Room Length (m):</label>
        <input
          type="number"
          step="0.01"
          value={roomLength}
          onChange={(e) => setRoomLength(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>Max Temperature (°C):</label>
        <input
          type="number"
          step="0.01"
          value={maxTemp}
          onChange={(e) => setMaxTemp(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>Min Temperature (°C):</label>
        <input
          type="number"
          step="0.01"
          value={minTemp}
          onChange={(e) => setMinTemp(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>Material:</label>
        <select value={material} onChange={(e) => setMaterial(e.target.value)} required>
          {Object.keys(materialProperties).map((materialName, index) => (
            <option key={index} value={materialName}>{materialName}</option>
          ))}
        </select>
      </div>
      <button type="submit">Add Interior Air Sensor</button>
    </form>
  );
}

export default InputRoom;
