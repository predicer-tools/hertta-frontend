// src/context/WeatherContext.js

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import ConfigContext from './ConfigContext'; // Ensure correct path
import { fetchWeatherData } from '../weatherApi'; // Ensure correct path

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const { config } = useContext(ConfigContext); // Access configuration
  const [weatherData, setWeatherData] = useState(() => {
    const storedWeather = localStorage.getItem('weatherData');
    return storedWeather ? JSON.parse(storedWeather) : null;
  });

  // Memoize getWeatherData to prevent unnecessary re-creations
  const getWeatherData = useCallback(async () => {
    if (!config.location) return;

    const currentTime = new Date();
    currentTime.setMinutes(0, 0, 0); // Start of the current hour
    const startTimeISO = currentTime.toISOString();
    const endTimeISO = new Date(currentTime.getTime() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours later

    try {
      const data = await fetchWeatherData(startTimeISO, endTimeISO, config.location);
      setWeatherData(data);
      localStorage.setItem('weatherData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    }
  }, [config.location]);

  // Initial fetch and setup interval for hourly updates
  useEffect(() => {
    if (config.location) {
      // Initial fetch
      getWeatherData();

      // Calculate the delay until the start of the next hour
      const now = new Date();
      const delay =
        (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

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
    }
  }, [config.location, getWeatherData]); // Added getWeatherData to dependencies

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

  return (
    <WeatherContext.Provider value={{ weatherData, setWeatherData, getWeatherData }}>
      {children}
    </WeatherContext.Provider>
  );
};

export default WeatherContext;
