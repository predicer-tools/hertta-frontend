// src/WeatherForecast.js

import React, { useState, useEffect, useRef } from 'react';
import { fetchWeatherData } from './weatherApi';
import './WeatherForecast.css'; // Optional: For styling

function WeatherForecast({ place, updateOutsideTemp }) {
  const [startTime, setStartTime] = useState(''); // Local time in 'YYYY-MM-DDTHH:MM'
  const [endTime, setEndTime] = useState(''); // Local time in 'YYYY-MM-DDTHH:MM'
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);

  // Function to get current time rounded up to the next hour
  const getNextHour = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0); // Zero out minutes, seconds, milliseconds
    now.setHours(now.getHours() + 1); // Move to the next hour
    return now;
  };

  // Function to get start and end times for next 12 hours
  const getStartAndEndTimes = () => {
    const start = getNextHour();
    const end = new Date(start.getTime() + 12 * 60 * 60 * 1000); // 12 hours later
    return { start, end };
  };

  // Function to format Date object to 'YYYY-MM-DDTHH:MM' for datetime-local input
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2); // Months are zero-indexed
    const day = (`0${date.getDate()}`).slice(-2);
    const hours = (`0${date.getHours()}`).slice(-2);
    const minutes = (`0${date.getMinutes()}`).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Function to convert 'YYYY-MM-DDTHH:MM' local time to ISO string in UTC
  const convertToISOString = (localDateTime) => {
    const localDate = new Date(localDateTime);
    return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString();
  };

  // Function to handle fetching weather data
  const handleFetchWeather = async (customStartTime, customEndTime) => {
    // Input validation
    if (!place) {
      setError('Place is not set. Please set it in the Input Data tab.');
      return;
    }

    // Determine the times to use for fetching
    let formattedStartTime = startTime;
    let formattedEndTime = endTime;

    if (customStartTime && customEndTime) {
      // If custom times are provided (manual fetch), use them
      formattedStartTime = convertToISOString(customStartTime);
      formattedEndTime = convertToISOString(customEndTime);
    } else {
      // Automatic fetch uses the state-managed times
      if (!startTime || !endTime) {
        setError('Start Time and End Time are not set.');
        return;
      }
      formattedStartTime = convertToISOString(startTime);
      formattedEndTime = convertToISOString(endTime);
    }

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const data = await fetchWeatherData(formattedStartTime, formattedEndTime, place);
      setWeatherData(data);

      // Extract the current hour's temperature
      const now = new Date();

      // Find the weather entry that matches the current hour
      const currentHourEntry = data.weather_values.find((entry) => {
        const entryDate = new Date(entry.time);
        return (
          entryDate.getFullYear() === now.getFullYear() &&
          entryDate.getMonth() === now.getMonth() &&
          entryDate.getDate() === now.getDate() &&
          entryDate.getHours() === now.getHours()
        );
      });

      if (currentHourEntry && currentHourEntry.value !== undefined && currentHourEntry.value !== null) {
        updateOutsideTemp(currentHourEntry.value);
      } else {
        updateOutsideTemp(null); // No data available
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data.');
      updateOutsideTemp(null); // Reset outsideTemp on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!place) {
      // If 'place' is not set, do not fetch automatically
      return;
    }

    // Automatic fetch on component mount or when 'place' changes
    const { start, end } = getStartAndEndTimes();
    const formattedStart = formatDateForInput(start);
    const formattedEnd = formatDateForInput(end);
    setStartTime(formattedStart);
    setEndTime(formattedEnd);

    // Perform the initial automatic fetch
    handleFetchWeather(formattedStart, formattedEnd);

    // Set up interval to fetch every hour
    intervalRef.current = setInterval(() => {
      const { start, end } = getStartAndEndTimes();
      const formattedStart = formatDateForInput(start);
      const formattedEnd = formatDateForInput(end);
      setStartTime(formattedStart);
      setEndTime(formattedEnd);
      handleFetchWeather(formattedStart, formattedEnd);
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    // Cleanup interval on component unmount or when 'place' changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]); // Re-run effect if 'place' changes

  return (
    <div className="weather-forecast-container">
      <h2>Weather Forecast</h2>

      {/* Display current place */}
      <p>
        Fetching weather data for: <strong>{place || 'Not set'}</strong>
      </p>

      {/* Display start and end times */}
      <div className="input-group">
        <label htmlFor="start-time">Start Time:</label>
        <input
          type="datetime-local"
          id="start-time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          disabled={true} // Disable manual editing of automatic start time
        />
      </div>
      <div className="input-group">
        <label htmlFor="end-time">End Time:</label>
        <input
          type="datetime-local"
          id="end-time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          disabled={true} // Disable manual editing of automatic end time
        />
      </div>

      {/* Manual Fetch Button */}
      <button onClick={() => handleFetchWeather(startTime, endTime)} disabled={loading || !place}>
        {loading ? 'Fetching...' : 'Get Weather'}
      </button>

      {/* Error Message */}
      {error && <p className="error-message">Error: {error}</p>}

      {/* Weather Data Display */}
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
