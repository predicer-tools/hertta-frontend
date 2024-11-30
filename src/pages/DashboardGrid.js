import React, { useContext } from 'react';
import Grid2 from '@mui/material/Grid2';
import DataContext from '../context/DataContext';

function DashboardGrid() {
  const { rooms, heaters } = useContext(DataContext);

  if (!rooms || rooms.length === 0) {
    return <div>No rooms available.</div>;
  }

  return (
    <Grid2 container spacing={2}>
      {rooms.map((room) => (
        <Grid2 size={6} key={room.roomId}>
          <div style={{ border: '1px solid #ccc', padding: '16px' }}>
            <h2>{room.roomId}</h2>
            <p>Width: {room.roomWidth} m</p>
            <p>Length: {room.roomLength} m</p>
            <p>Max Temp: {room.maxTemp} °C</p>
            <p>Min Temp: {room.minTemp} °C</p>
            <p>Material: {room.material}</p>
            <p>Sensor ID: {room.sensorId}</p>
            <Grid2 container spacing={1}>
              {heaters
                .filter((heater) => heater.roomId === room.roomId)
                .map((heater) => (
                  <Grid2 size={4} key={heater.id}>
                    <div style={{ border: '1px solid #aaa', padding: '8px' }}>
                      <h4>{heater.name}</h4>
                      <p>Status: {heater.isEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </Grid2>
                ))}
            </Grid2>
          </div>
        </Grid2>
      ))}
    </Grid2>
  );
}

export default DashboardGrid;
