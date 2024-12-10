// src/context/DataContext.js

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import useWeatherData from '../hooks/useWeatherData'; 
import useElectricityData from '../hooks/useElectricityData';
import ConfigContext from './ConfigContext'; // Import ConfigContext
import { generateControlSignals } from '../utils/controlData';

// Create the DataContext
const DataContext = createContext();

// DataProvider component to wrap around parts of the app that need access to the data
export const DataProvider = ({ children }) => {
  // =====================
  // Existing States
  // =====================

  // State for Rooms
  const [rooms, setRooms] = useState(() => {
    const storedRooms = JSON.parse(localStorage.getItem('rooms')) || [];
    // Migrate existing rooms to include new fields and remove invalid exceptions
    const migratedRooms = storedRooms.map(room => {
      const {
        defaultMaxTemp = room.maxTemp || 25,
        defaultMinTemp = room.minTemp || 15,
        exceptions = []
      } = room;

      // Filter out exceptions that duplicate default temperatures
      const filteredExceptions = exceptions.filter(ex => {
        return !(ex.maxTemp === defaultMaxTemp && ex.minTemp === defaultMinTemp);
      });

      return {
        ...room,
        defaultMaxTemp,
        defaultMinTemp,
        exceptions: filteredExceptions
      };
    });
    return migratedRooms;
  });

  // State for Heaters
  const [heaters, setHeaters] = useState(() => {
    return JSON.parse(localStorage.getItem('heaters')) || [];
  });

  // State for Control Signals
  const [controlSignals, setControlSignals] = useState(() => {
    return JSON.parse(localStorage.getItem('controlSignals')) || {};
  });

  // =====================
  // Use the Hooks
  // =====================

  // Get config from ConfigContext
  const { config } = useContext(ConfigContext);
  const location = config.location;

  // Integrate the new weather data hook (location comes from ConfigContext)
  const { weatherData, loading: weatherLoading, error: weatherError } = useWeatherData(location);

  const currentWeather =
  weatherData && Array.isArray(weatherData.weather_values) && weatherData.weather_values.length > 0
    ? weatherData.weather_values[0]
    : null;

  console.log("Current Weather:", currentWeather);

  const { fiPrices, fiPricesLoading, fiPricesError } = useElectricityData();

  const [optimizeStarted, setOptimizeStarted] = useState(() => {
    const storedOptimizeStarted = JSON.parse(localStorage.getItem('optimizeStarted'));
    return storedOptimizeStarted || false;
  });

  const [lastOptimizedTime, setLastOptimizedTime] = useState(() => {
    return JSON.parse(localStorage.getItem('lastOptimizedTime')) || null;
  });
  

  const startOptimization = useCallback(() => {
    const now = new Date();
    console.log('Starting optimization at:', now);
  
    if (!heaters || heaters.length === 0 || !fiPrices || fiPrices.length === 0) {
      const generatedControlSignals = generateControlSignals(heaters, []);
      setControlSignals(generatedControlSignals);
      setOptimizeStarted(true); // Set optimizeStarted to true
      setLastOptimizedTime(now);
  
      // Persist data
      localStorage.setItem('controlSignals', JSON.stringify(generatedControlSignals));
      localStorage.setItem('optimizeStarted', JSON.stringify(true));
      localStorage.setItem('lastOptimizedTime', JSON.stringify(now));
  
      console.log('Optimization completed with OFF signals at:', now);
      return;
    }
  
    const generatedControlSignals = generateControlSignals(heaters, fiPrices);
    setControlSignals(generatedControlSignals);
    setOptimizeStarted(true); // Set optimizeStarted to true
    setLastOptimizedTime(now);
  
    // Persist data
    localStorage.setItem('controlSignals', JSON.stringify(generatedControlSignals));
    localStorage.setItem('optimizeStarted', JSON.stringify(true));
    localStorage.setItem('lastOptimizedTime', JSON.stringify(now));
  
    console.log('Optimization completed with generated signals at:', now);
  }, [heaters, fiPrices]);

  const stopOptimization = useCallback(() => {
    console.log('Stopping optimization...');
    setOptimizeStarted(false);
    setControlSignals({}); // Clear control signals or leave them as is
    setLastOptimizedTime(null);
  
    // Persist the reset state
    localStorage.removeItem('controlSignals');
    localStorage.setItem('optimizeStarted', JSON.stringify(false));
    localStorage.removeItem('lastOptimizedTime');
  }, []);

  useEffect(() => {
    if (!optimizeStarted || !lastOptimizedTime) return;
  
    const intervalId = setInterval(() => {
      const now = new Date();
      const diffInMinutes = (now - new Date(lastOptimizedTime)) / (1000 * 60);
  
      if (diffInMinutes >= 15) {
        console.log('Automatically triggering optimization.');
        startOptimization();
      }
    }, 60000); // Check every 60 seconds
  
    return () => clearInterval(intervalId); // Cleanup on component unmount or optimizeStarted change
  }, [optimizeStarted, lastOptimizedTime, startOptimization]);

  // =====================
  // Load Rooms Data from LocalStorage on Mount (Existing - Preserved)
  // =====================

  // Already handled in initial useState with potential migration

  // =====================
  // Load Heaters Data from LocalStorage on Mount (Existing - Preserved)
  // =====================

  useEffect(() => {
    const storedHeaters = JSON.parse(localStorage.getItem('heaters')) || [];
    setHeaters(storedHeaters);
  }, []);

  // =====================
  // Persist Rooms Data to LocalStorage on Change (Updated)
  // =====================

  useEffect(() => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  }, [rooms]);

  // =====================
  // Persist Heaters Data to LocalStorage on Change (Existing - Preserved)
  // =====================

  useEffect(() => {
    localStorage.setItem('heaters', JSON.stringify(heaters));
  }, [heaters]);

  // =====================
  // Functions to Manipulate Rooms (Updated)
  // =====================

  /**
   * Adds a new room to the rooms state.
   * Prevents adding rooms with duplicate roomIds.
   * @param {Object} room - The room object to add.
   * @returns {boolean} - Returns true if room is added successfully, false otherwise.
   */
  const addRoom = useCallback((room) => {
    // Destructure room object to ensure required fields are present
    const {
      roomId,
      roomWidth,
      roomLength,
      defaultMaxTemp,
      defaultMinTemp,
      sensorId,
      sensorState,
      sensorUnit,
      exceptions = []
    } = room;
  
    // Validate required fields
    if (
      !roomId ||
      !roomWidth ||
      !roomLength ||
      defaultMaxTemp === undefined ||
      defaultMinTemp === undefined ||
      !sensorId
    ) {
      console.error('Missing required room fields.');
      return false;
    }

    // Check for duplicate roomId (case-insensitive)
    const isDuplicateRoom = rooms.some(
      (existingRoom) => existingRoom.roomId.toLowerCase() === roomId.toLowerCase()
    );

    if (isDuplicateRoom) {
      console.error(`Room with ID "${roomId}" already exists.`);
      return false; // Indicate failure to add
    }

    // Construct new room object
    const newRoom = {
      roomId,
      roomWidth,
      roomLength,
      defaultMaxTemp,
      defaultMinTemp,
      sensorId,
      sensorState,
      sensorUnit,
      exceptions
    };

    setRooms((prevRooms) => {
      const updatedRooms = [...prevRooms, newRoom];
      console.log('Room added:', newRoom);
      console.log('Updated Rooms:', updatedRooms);
      return updatedRooms;
    });
    return true; // Indicate successful addition
  }, [rooms]);

  /**
   * Deletes a room from the rooms state based on roomId.
   * Also deletes associated heaters.
   * @param {string} roomId - The ID of the room to delete.
   */
  const deleteRoom = useCallback((roomId) => {
    setRooms((prevRooms) => prevRooms.filter((room) => room.roomId !== roomId));
    // Also delete heaters associated with this room
    setHeaters((prevHeaters) => prevHeaters.filter((heater) => heater.roomId !== roomId));
  }, []);

  // =====================
  // Functions to Manipulate Heaters (Existing - Preserved)
  // =====================

  /**
   * Adds a new electric heater to the heaters state.
   * Prevents adding heaters with duplicate IDs.
   * @param {Object} heater - The heater object to add.
   */
  const addElectricHeater = useCallback((heater) => {
    // Destructure heater object to ensure required fields are present
    const {
      id,
      roomId,
      // ... other heater fields
    } = heater;

    // Validate required fields
    if (!id || !roomId) {
      console.error('Missing required heater fields.');
      return;
    }

    // Check for duplicate heater ID
    const isDuplicateHeater = heaters.find(
      (existingHeater) => existingHeater.id.toLowerCase() === id.toLowerCase()
    );

    if (isDuplicateHeater) {
      console.error(`Heater with ID "${id}" already exists.`);
      return;
    }

    setHeaters((prevHeaters) => [
      ...prevHeaters,
      {
        ...heater,
        isEnabled: true, // Initialize isEnabled as true
      },
    ]);
  }, [heaters]);

  /**
   * Deletes an electric heater from the heaters state based on heaterId.
   * @param {string} heaterId - The ID of the heater to delete.
   */
  const deleteHeater = useCallback((heaterId) => {
    setHeaters((prevHeaters) => prevHeaters.filter((heater) => heater.id !== heaterId));
    // Also delete control signals associated with this heater
    const updatedControlSignals = { ...controlSignals };
    delete updatedControlSignals[heaterId];
    setControlSignals(updatedControlSignals);
    localStorage.setItem('controlSignals', JSON.stringify(updatedControlSignals));
  }, [controlSignals]);

  const toggleHeaterEnabled = useCallback((heaterId) => {
    setHeaters((prevHeaters) =>
      prevHeaters.map((heater) =>
        heater.id === heaterId ? { ...heater, isEnabled: !heater.isEnabled } : heater
      )
    );
  }, []);

  // =====================
  // Function to Update a Heater (Existing - Preserved)
  // =====================

  /**
   * Updates an existing heater's details.
   * @param {Object} updatedHeater - The heater object with updated details.
   */
  const updateHeaterFunc = useCallback((updatedHeater) => {
    setHeaters((prevHeaters) =>
      prevHeaters.map((heater) =>
        heater.id === updatedHeater.id ? { ...heater, ...updatedHeater } : heater
      )
    );
  }, []);

  // =====================
  // Function to Update a Room (Updated)
  // =====================

  /**
   * Updates an existing room's details.
   * @param {Object} updatedRoom - The room object with updated details.
   * @returns {boolean} - Returns true if update is successful, false otherwise.
   */
  const updateRoomFunc = useCallback((updatedRoom) => {
    const {
      roomId,
      roomWidth,
      roomLength,
      defaultMaxTemp,
      defaultMinTemp,
      sensorId,
      sensorState,
      sensorUnit,
      exceptions
    } = updatedRoom;

    // Validate required fields
    if (
      !roomId ||
      !roomWidth ||
      !roomLength ||
      defaultMaxTemp === undefined ||
      defaultMinTemp === undefined ||
      !sensorId
    ) {
      console.error('Missing required room fields.');
      return false;
    }

    // Validation: Ensure no exception has the same temp as default
  for (let i = 0; i < exceptions.length; i++) {
    const ex = exceptions[i];
    if (ex.maxTemp === defaultMaxTemp && ex.minTemp === defaultMinTemp) {
      console.error(`Exception ${i + 1} has the same maxTemp and minTemp as the room's defaults.`);
      return false; // Prevent adding or updating this exception
    }
  }

    setRooms((prevRooms) => {
      const roomExists = prevRooms.some((room) => room.roomId === roomId);
      if (!roomExists) {
        console.error(`Room with ID "${roomId}" does not exist.`);
        return prevRooms;
      }

      return prevRooms.map((room) =>
        room.roomId === roomId ? { ...room, ...updatedRoom } : room
      );
    });

    return true;
  }, []);

  // =====================
  // Function to Reset All Data (Existing - Preserved)
  // =====================

  /**
   * Resets all data in the DataContext to their initial empty states.
   * Clears corresponding localStorage entries.
   */
  const resetData = useCallback(() => {
    // Reset all states to their initial empty values
    setRooms([]);
    setHeaters([]);
    setControlSignals({});
    setOptimizeStarted(false);
    setLastOptimizedTime(null);

    // Clear corresponding localStorage entries
    localStorage.removeItem('rooms');
    localStorage.removeItem('heaters');
    localStorage.removeItem('fiElectricityPrices');
    localStorage.removeItem('weatherData');
    localStorage.removeItem('controlSignals');
    localStorage.removeItem('optimizeStarted');
    localStorage.removeItem('lastOptimizedTime');
  }, []);

  // =====================
  // Provider's Value
  // =====================

  return (
    <DataContext.Provider
      value={{
        // Rooms State and Functions
        rooms,
        setRooms,
        addRoom,
        deleteRoom,
        updateRoom: updateRoomFunc,

        // Heaters State and Functions
        heaters,
        setHeaters,
        addElectricHeater,
        deleteHeater,
        toggleHeaterEnabled,
        updateHeater: updateHeaterFunc,

        // Electricity Prices
        fiPrices,
        fiPricesLoading,
        fiPricesError,

        // Control Signals
        controlSignals,
        setControlSignals,
        optimizeStarted,
        startOptimization,
        stopOptimization,
        lastOptimizedTime,

        // Weather Data (from useWeatherData hook)
        weatherData,
        weatherLoading,
        weatherError,
        currentWeather,

        // Reset
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
