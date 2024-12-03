// src/context/DataContext.js

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { generateControlSignals } from '../utils/controlData'; // Import the control signals utility
import useElectricityPrices from '../hooks/useElectricityPrices';
import useWeatherData from '../hooks/useWeatherData'; 
import ConfigContext from './ConfigContext'; // Import ConfigContext

// Create the DataContext
const DataContext = createContext();

// DataProvider component to wrap around parts of the app that need access to the data
export const DataProvider = ({ children }) => {
  // =====================
  // Existing States
  // =====================

  // State for Rooms
  const [rooms, setRooms] = useState(() => {
    return JSON.parse(localStorage.getItem('rooms')) || [];
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

  const { config } = useContext(ConfigContext); // Consume ConfigContext to get configuration
  const location = config.location; // Extract location from config
  
  const { fiPrices, loading: fiPricesLoading, error: fiPricesError } = useElectricityPrices();
  const { weatherData, loading: weatherLoading, error: weatherError } = useWeatherData(location);

  // =====================
  // Load Rooms Data from LocalStorage on Mount (Existing - Preserved)
  // =====================

  useEffect(() => {
    const storedRooms = JSON.parse(localStorage.getItem('rooms')) || [];
    setRooms(storedRooms);
  }, []);

  // =====================
  // Load Heaters Data from LocalStorage on Mount (Existing - Preserved)
  // =====================

  useEffect(() => {
    const storedHeaters = JSON.parse(localStorage.getItem('heaters')) || [];
    setHeaters(storedHeaters);
  }, []);

  // =====================
  // Persist Rooms Data to LocalStorage on Change (Existing - Preserved)
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
  // Generate and Store Control Signals
  // =====================

  useEffect(() => {
    if (heaters.length === 0 || fiPrices.length === 0) {
      // If no heaters or no price data, set all control signals to OFF
      const defaultControlSignals = {};
      heaters.forEach((heater) => {
        defaultControlSignals[heater.id] = Array(12).fill('OFF');
      });
      setControlSignals(defaultControlSignals);
      localStorage.setItem('controlSignals', JSON.stringify(defaultControlSignals));
      return;
    }

    // Generate control signals
    const generatedControlSignals = generateControlSignals(heaters, fiPrices);
    setControlSignals(generatedControlSignals);
    localStorage.setItem('controlSignals', JSON.stringify(generatedControlSignals));
  }, [heaters, fiPrices]);

  // =====================
  // Functions to Manipulate Rooms (Existing - Preserved)
  // =====================

  /**
   * Adds a new room to the rooms state.
   * Prevents adding rooms with duplicate roomIds.
   * @param {Object} room - The room object to add.
   */
  const addRoom = (room) => {
    // Check for duplicate roomId (case-insensitive)
    const duplicateRoom = rooms.find(
      (existingRoom) => existingRoom.roomId.toLowerCase() === room.roomId.toLowerCase()
    );

    if (duplicateRoom) {
      // Room with the same ID already exists
      console.error(`Room with ID "${room.roomId}" already exists.`);
      return false; // Indicate failure to add
    }

    setRooms((prevRooms) => [...prevRooms, room]);
    return true; // Indicate successful addition
  };

  /**
   * Deletes a room from the rooms state based on roomId.
   * Also deletes associated heaters.
   * @param {string} roomId - The ID of the room to delete.
   */
  const deleteRoom = (roomId) => {
    setRooms((prevRooms) => prevRooms.filter((room) => room.roomId !== roomId));
    // Also delete heaters associated with this room
    setHeaters((prevHeaters) => prevHeaters.filter((heater) => heater.roomId !== roomId));
  };

  // =====================
  // Functions to Manipulate Heaters (Existing - Preserved)
  // =====================

  /**
   * Adds a new electric heater to the heaters state.
   * Prevents adding heaters with duplicate IDs.
   * @param {Object} heater - The heater object to add.
   */
  const addElectricHeater = (heater) => {
    // Check for duplicate heater ID
    const duplicateHeater = heaters.find(
      (existingHeater) => existingHeater.id.toLowerCase() === heater.id.toLowerCase()
    );

    if (duplicateHeater) {
      // Heater with the same ID already exists
      console.error(`Heater with ID "${heater.id}" already exists.`);
      return;
    }

    setHeaters((prevHeaters) => [
      ...prevHeaters,
      {
        ...heater,
        isEnabled: true, // Initialize isEnabled as true
      },
    ]);
  };

  /**
   * Deletes an electric heater from the heaters state based on heaterId.
   * @param {string} heaterId - The ID of the heater to delete.
   */
  const deleteHeater = (heaterId) => {
    setHeaters((prevHeaters) => prevHeaters.filter((heater) => heater.id !== heaterId));
    // Also delete control signals associated with this heater
    const updatedControlSignals = { ...controlSignals };
    delete updatedControlSignals[heaterId];
    setControlSignals(updatedControlSignals);
    localStorage.setItem('controlSignals', JSON.stringify(updatedControlSignals));
  };

  /**
   * Toggles the `isEnabled` state of a heater.
   * @param {string} heaterId - The ID of the heater to toggle.
   */
  const toggleHeaterEnabled = (heaterId) => {
    setHeaters((prevHeaters) =>
      prevHeaters.map((heater) =>
        heater.id === heaterId ? { ...heater, isEnabled: !heater.isEnabled } : heater
      )
    );
  };

  // =====================
  // Function to Update a Heater
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
  // Function to Update a Room
  // =====================

  /**
   * Updates an existing room's details.
   * @param {Object} updatedRoom - The room object with updated details.
   */
  const updateRoomFunc = useCallback((updatedRoom) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.roomId === updatedRoom.roomId ? { ...room, ...updatedRoom } : room
      )
    );
  }, []);

  // =====================
  // Function to Reset All Data
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

    // Clear corresponding localStorage entries
    localStorage.removeItem('rooms');
    localStorage.removeItem('heaters');
    localStorage.removeItem('fiElectricityPrices');
    localStorage.removeItem('weatherData');
    localStorage.removeItem('controlSignals');
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

        // Control signals
        controlSignals,
        setControlSignals,

        // Electricity Prices
        fiPrices,
        fiPricesLoading,
        fiPricesError,

        // Weather Data
        weatherData,
        weatherLoading,
        weatherError,

        // Reset
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
