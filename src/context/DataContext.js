// src/context/DataContext.js

import React, { createContext, useState, useEffect } from 'react';

// Create the DataContext
const DataContext = createContext();

// DataProvider component to wrap around parts of the app that need access to the data
export const DataProvider = ({ children }) => {
  // =====================
  // Existing States
  // =====================

  // State for Rooms
  const [rooms, setRooms] = useState([]);

  // State for Heaters
  const [heaters, setHeaters] = useState([]);

  // State for Electricity Prices
  const [electricityPrices, setElectricityPrices] = useState([]);

  // =====================
  // Loading and Error States for Electricity Prices
  // =====================
  
  const [loadingElectricityPrices, setLoadingElectricityPrices] = useState(true);
  const [errorElectricityPrices, setErrorElectricityPrices] = useState(null);

  // =====================
  // Fetch Electricity Prices from Backend
  // =====================
  
  useEffect(() => {
    const fetchElectricityPrices = async () => {
      setLoadingElectricityPrices(true);
      try {
        const response = await fetch('http://localhost:5000/api/electricity-prices');
        const result = await response.json();

        // Debugging: Log the API response
        console.log('Electricity Prices API Response:', result);

        if (result.success) {
          setElectricityPrices(result.data);
          localStorage.setItem('electricityPrices', JSON.stringify(result.data));
          setErrorElectricityPrices(null);
        } else {
          console.error('Error fetching electricity prices:', result.error);
          setErrorElectricityPrices(result.error);
        }
      } catch (error) {
        console.error('Error fetching electricity prices:', error);
        setErrorElectricityPrices('An unexpected error occurred while fetching electricity prices.');
      } finally {
        setLoadingElectricityPrices(false);
      }
    };

    fetchElectricityPrices();
  }, []);

  // =====================
  // Load Electricity Prices from LocalStorage on Mount
  // =====================
  
  useEffect(() => {
    const storedPrices = JSON.parse(localStorage.getItem('electricityPrices'));
    if (storedPrices) {
      setElectricityPrices(storedPrices);
      setLoadingElectricityPrices(false);
    }
  }, []);

  // =====================
  // Load Rooms Data from LocalStorage on Mount
  // =====================
  
  useEffect(() => {
    const storedRooms = JSON.parse(localStorage.getItem('rooms')) || [];
    setRooms(storedRooms);
  }, []);

  // =====================
  // Load Heaters Data from LocalStorage on Mount
  // =====================
  
  useEffect(() => {
    const storedHeaters = JSON.parse(localStorage.getItem('heaters')) || [];
    setHeaters(storedHeaters);
  }, []);

  // =====================
  // Persist Rooms Data to LocalStorage on Change
  // =====================
  
  useEffect(() => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  }, [rooms]);

  // =====================
  // Persist Heaters Data to LocalStorage on Change
  // =====================
  
  useEffect(() => {
    localStorage.setItem('heaters', JSON.stringify(heaters));
  }, [heaters]);

  // =====================
  // Functions to Manipulate Rooms
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
   * @param {string} roomId - The ID of the room to delete.
   */
  const deleteRoom = (roomId) => {
    setRooms((prevRooms) => prevRooms.filter((room) => room.roomId !== roomId));
  };

  // =====================
  // Functions to Manipulate Heaters
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

        // Electricity Prices State and Functions
        electricityPrices,
        setElectricityPrices,
        loadingElectricityPrices,
        errorElectricityPrices,

        // ... Add any other states and setters you have
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
