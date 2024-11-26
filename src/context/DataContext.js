// src/context/DataContext.js

import React, { createContext, useState, useEffect } from 'react';
import { fetchElectricityPricesFi } from '../api/elering'; // Import the new API utility

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

  // State for Electricity Prices (Existing - Preserved)
  const [electricityPrices, setElectricityPrices] = useState(() => {
    return JSON.parse(localStorage.getItem('electricityPrices')) || [];
  });

  // =====================
  // New State for FI Electricity Prices
  // =====================

  const [fiElectricityPrices, setFiElectricityPrices] = useState(() => {
    return JSON.parse(localStorage.getItem('fiElectricityPrices')) || [];
  });

  // =====================
  // Loading and Error States for FI Electricity Prices
  // =====================

  const [loadingFiPrices, setLoadingFiPrices] = useState(true);
  const [errorFiPrices, setErrorFiPrices] = useState(null);

  // =====================
  // Fetch FI Electricity Prices from Elering API
  // =====================

  useEffect(() => {
    const fetchFiPrices = async () => {
      setLoadingFiPrices(true);
      try {
        // Define the start and end times
        const start = '2024-11-26T09:00:00.000Z';
        const end = '2024-11-26T18:00:00.000Z';

        const fiPrices = await fetchElectricityPricesFi(start, end);
        setFiElectricityPrices(fiPrices);
        localStorage.setItem('fiElectricityPrices', JSON.stringify(fiPrices));
        setErrorFiPrices(null);
      } catch (error) {
        setErrorFiPrices(error.message);
      } finally {
        setLoadingFiPrices(false);
      }
    };

    fetchFiPrices();
  }, []); // Empty dependency array ensures this runs once on mount

  // =====================
  // Load Electricity Prices from LocalStorage on Mount (Existing - Preserved)
  // =====================

  useEffect(() => {
    const storedPrices = JSON.parse(localStorage.getItem('electricityPrices'));
    if (storedPrices) {
      setElectricityPrices(storedPrices);
    }
  }, []);

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
  // Persist FI Electricity Prices to LocalStorage on Change (New)
  // =====================

  useEffect(() => {
    localStorage.setItem('fiElectricityPrices', JSON.stringify(fiElectricityPrices));
  }, [fiElectricityPrices]);

  // =====================
  // Functions to Manipulate Rooms (Existing - Preserved)
  // =====================

  /**
   * Adds a new room to the rooms state.
   * @param {Object} room - The room object to add.
   */
  const addRoom = (room) => {
    setRooms((prevRooms) => [...prevRooms, room]);
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
   * @param {Object} heater - The heater object to add.
   */
  const addElectricHeater = (heater) => {
    setHeaters((prevHeaters) => [...prevHeaters, heater]);
  };

  /**
   * Deletes an electric heater from the heaters state based on heaterId.
   * @param {string} heaterId - The ID of the heater to delete.
   */
  const deleteHeater = (heaterId) => {
    setHeaters((prevHeaters) => prevHeaters.filter((heater) => heater.id !== heaterId));
  };

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

        // Heaters State and Functions
        heaters,
        setHeaters,
        addElectricHeater,
        deleteHeater,

        // Existing Electricity Prices State and Functions
        electricityPrices,
        setElectricityPrices,

        // New FI Electricity Prices State and Functions
        fiElectricityPrices,
        setFiElectricityPrices,
        loadingFiPrices,
        errorFiPrices,

        // ... Add any other states and setters you have
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
