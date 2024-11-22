// src/WeatherForecast.js

import React, { useState } from 'react';
import { fetchWeatherData } from './weatherApi';
import './WeatherForecast.css'; // Optional: For styling

function WeatherForecast() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [place, setPlace] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchWeather = async () => {
    // Input validation
    if (!startTime || !endTime || !place) {
      setError('Please fill in all fields.');
      return;
    }

    // Convert to ISO format with 'Z' to indicate UTC time
    const formattedStartTime = new Date(startTime).toISOString();
    const formattedEndTime = new Date(endTime).toISOString();

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const data = await fetchWeatherData(formattedStartTime, formattedEndTime, place);
      setWeatherData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-forecast-container">
      <h2>Weather Forecast</h2>
      <div className="input-group">
        <label htmlFor="start-time">Start Time:</label>
        <input
          type="datetime-local"
          id="start-time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="end-time">End Time:</label>
        <input
          type="datetime-local"
          id="end-time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="place">Place:</label>
        <input
          type="text"
          id="place"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="e.g., Helsinki"
        />
      </div>
      <button onClick={handleFetchWeather} disabled={loading}>
        {loading ? 'Fetching...' : 'Get Weather'}
      </button>

      {error && <p className="error-message">Error: {error}</p>}

      {weatherData && (
        <div className="weather-data">
          <h3>Weather Forecast for {weatherData.place}</h3>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Temperature (°C)</th>
              </tr>
            </thead>
            <tbody>
              {weatherData.weather_values.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.time).toLocaleString()}</td>
                  <td>{entry.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default WeatherForecast;
