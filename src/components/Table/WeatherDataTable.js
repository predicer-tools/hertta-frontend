import React from 'react';

const WeatherDataTable = ({ weatherData }) => {
  if (!weatherData || !weatherData.weather_values || weatherData.weather_values.length === 0) {
    return <p>No weather data available.</p>;
  }

  return (
    <div>
      <h2>Weather Data for {weatherData.place}</h2>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Temperature (°C)</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.weather_values.map((entry, index) => (
            <tr key={index}>
              <td>{entry.time}</td>
              <td>{entry.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeatherDataTable;
