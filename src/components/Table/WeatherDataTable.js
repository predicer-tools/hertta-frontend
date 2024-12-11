import React from 'react';
import styles from './WeatherDataTable.module.css';

const WeatherDataTable = ({ weatherData }) => {
  if (!weatherData || !weatherData.weather_values || weatherData.weather_values.length === 0) {
    return <p>No weather data available.</p>;
  }

  // Helper function to format timestamps without changing the timezone
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${day}.${month}.${year} klo ${hours}.${minutes}`;
  };

  return (
    <div className={styles.tableWrapper}>
      <h2 className={styles.title}>Weather Data for {weatherData.place}</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Temperature (°C)</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.weather_values.map((entry, index) => (
            <tr key={index}>
              <td>{formatTimestamp(entry.time)}</td>
              <td>{entry.value.toFixed(2)} °C</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeatherDataTable;
