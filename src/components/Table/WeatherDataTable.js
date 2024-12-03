// src/components/Table/WeatherDataTable.js

import React, { useContext } from 'react';
import DataContext from '../../context/DataContext';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';

function WeatherDataTable() {
  const { weatherData, weatherLoading, weatherError } = useContext(DataContext);

  if (weatherLoading) {
    return <CircularProgress />;
  }

  if (weatherError) {
    return (
      <Typography variant="body1" color="error">
        Failed to load weather data.
      </Typography>
    );
  }

  if (!weatherData) {
    return <Typography variant="body1">No weather data available.</Typography>;
  }

  const { currentTemp, weather_values } = weatherData;

  // Defensive Checks
  if (!weather_values) {
    return <Typography variant="body1">Weather values are unavailable.</Typography>;
  }

  const { currentCondition, forecast } = weather_values;

  if (!forecast || !Array.isArray(forecast)) {
    return <Typography variant="body1">Weather forecast data is unavailable.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Temperature (°C)</TableCell>
            <TableCell>Condition</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Current</TableCell>
            <TableCell>{currentTemp}°C</TableCell>
            <TableCell>{currentCondition}</TableCell>
          </TableRow>
          {forecast.map((forecastItem, index) => (
            <TableRow key={index}>
              <TableCell>
                {new Date(forecastItem.time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TableCell>
              <TableCell>{forecastItem.temperature}°C</TableCell>
              <TableCell>{forecastItem.condition}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default WeatherDataTable;
