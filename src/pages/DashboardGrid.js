// src/pages/DashboardGrid.js

import React, { useContext } from 'react';
import Grid from '@mui/material/Grid';
import DataContext from '../context/DataContext';

function DashboardGrid() {
  const { rooms } = useContext(DataContext);

  console.log('DashboardGrid rooms:', rooms); // Debugging log

  if (!rooms || rooms.length === 0) {
    return <div>No rooms available.</div>;
  }

  return (
    <Grid container spacing={2}>
      {rooms.map((room) => (
        <Grid item xs={12} sm={6} md={4} key={room.roomId}>
          <div style={{ border: '1px solid #ccc', padding: '16px' }}>
            <h2>{room.roomId}</h2>
            <p>Width: {room.roomWidth} m</p>
            <p>Length: {room.roomLength} m</p>
            <p>Max Temp: {room.maxTemp} °C</p>
            <p>Min Temp: {room.minTemp} °C</p>
            <p>Material: {room.material}</p>
            <p>Sensor ID: {room.sensorId}</p>
            {/* Add any other room details you want to display */}
          </div>
        </Grid>
      ))}
    </Grid>
  );
}

export default DashboardGrid;
