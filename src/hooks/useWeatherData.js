// src/hooks/useWeatherData.js

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React hook to fetch weather data.
 * It fetches data for the current hour and the next 11 hours.
 *
 * @param {string} location - The location for which to fetch weather data.
 * @returns {Object} - Contains `weatherData`, `loading`, and `error` states.
 */
function useWeatherData(location) {
  const [weatherData, setWeatherData] = useState(() => {
    const storedWeather = localStorage.getItem('weatherData');
    return storedWeather ? JSON.parse(storedWeather) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches weather data from the backend API.
   *
   * @param {string} startTime - Start time in ISO format.
   * @param {string} endTime - End time in ISO format.
   * @param {string} place - Place name.
   * @returns {Promise<Object>} - A promise that resolves to the weather data, including currentTemp.
   */
  const fetchWeatherData = async (startTime, endTime, place) => {
    const baseUrl = 'http://localhost:5000/get_weather_data';
    const params = new URLSearchParams({ start_time: startTime, end_time: endTime, place });

    try {
      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Extract currentTemp from the first entry of weather_values
      let currentTemp = null;
      if (data.weather_values && Array.isArray(data.weather_values) && data.weather_values.length > 0) {
        currentTemp = data.weather_values[0].value; // Adjust based on your data structure
      }

      return {
        ...data,
        currentTemp, // Add currentTemp to the returned data
      };
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      throw error;
    }
  };

  const getWeatherData = useCallback(async () => {
    if (!location) {
      setLoading(false);
      setWeatherData(null);
      return;
    }

    const currentTime = new Date();
    currentTime.setMinutes(0, 0, 0); // Start of the current hour
    const startTimeISO = currentTime.toISOString();
    const endTimeISO = new Date(currentTime.getTime() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours later

    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeatherData(startTimeISO, endTimeISO, location);

      // Validate the response structure
      if (
        data &&
        typeof data.currentTemp === 'number' &&
        data.weather_values &&
        typeof data.weather_values.currentCondition === 'string' &&
        Array.isArray(data.weather_values.forecast)
      ) {
        setWeatherData(data);
        localStorage.setItem('weatherData', JSON.stringify(data));
      } else {
        throw new Error('Invalid data structure received from Weather API.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    getWeatherData();

    // Calculate the delay until the start of the next hour
    const now = new Date();
    const delay =
      (60 - now.getMinutes()) * 60 * 1000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds();

    // Set a timeout to fetch at the start of the next hour
    const timeoutId = setTimeout(() => {
      getWeatherData();

      // Then set an interval to fetch every hour
      const intervalId = setInterval(getWeatherData, 60 * 60 * 1000); // Every hour

      // Cleanup function for interval
      return () => clearInterval(intervalId);
    }, delay);

    // Cleanup function for timeout
    return () => clearTimeout(timeoutId);
  }, [getWeatherData]);

  // Listen for changes in weatherData from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'weatherData') {
        setWeatherData(event.newValue ? JSON.parse(event.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { weatherData, loading, error };
}

export default useWeatherData;
