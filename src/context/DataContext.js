// src/context/DataContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { fetchElectricityPricesFi } from '../api/elering'; // Import the new API utility
import { generateControlSignals } from '../utils/controlData'; // Import the control signals utility

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

  // State for Electricity Prices (Converted to snt/kWh)
  const [electricityPrices, setElectricityPrices] = useState(() => {
    return JSON.parse(localStorage.getItem('electricityPrices')) || [];
  });

  // =====================
  // Loading and Error States for FI Electricity Prices
  // =====================

  const [loadingFiPrices, setLoadingFiPrices] = useState(true);
  const [errorFiPrices, setErrorFiPrices] = useState(null);

  // =====================
  // New State for Control Signals
  // =====================

  const [controlSignals, setControlSignals] = useState(() => {
    return JSON.parse(localStorage.getItem('controlSignals')) || {};
  });

    // =====================
  // Helper Function to Process FI Electricity Prices
  // =====================

  /**
   * Processes FI electricity prices by converting timestamps to Date objects.
   * @param {Array} prices - Array of price objects with { timestamp, price }.
   * @returns {Array}
   */
  const processFiElectricityPrices = useCallback((prices) => {
    return prices.map((entry) => ({
      ...entry,
      date: new Date(entry.timestamp * 1000), // Convert timestamp to Date object
    }));
  }, []);

  // =====================
  // Helper Function for Conversion
  // =====================

  /**
   * Converts electricity prices from €/MWh to snt/kWh.
   * @param {Array} prices - Array of price objects with { timestamp, price }.
   * @returns {Array} - Converted array with prices in snt/kWh.
   */
  const convertEuromWhToSntKWh = useCallback((prices) => {
    return prices.map((entry) => ({
      ...entry,
      price: parseFloat(entry.price) * 0.1, // Convert to snt/kWh
    }));
  }, []);

    // =====================
  // State for FI Electricity Prices (Converted to snt/kWh)
  // =====================

  const [fiElectricityPrices, setFiElectricityPrices] = useState(() => {
    const storedPrices = JSON.parse(localStorage.getItem('fiElectricityPrices')) || [];
    return processFiElectricityPrices(storedPrices); // Process stored prices
  });

    /**
   * State to hold the current electricity price based on the current time.
   */
    const [currentFiElectricityPrice, setCurrentFiElectricityPrice] = useState(null);

  // =====================
  // Fetch FI Electricity Prices from Elering API (Converted to snt/kWh)
  // =====================

  useEffect(() => {
    const fetchFiPrices = async () => {
      setLoadingFiPrices(true);
      try {
        // Define the start and end times (next 12 hours from current time)
        const now = new Date();
        const start = now.toISOString();
        const end = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();

        const fiPrices = await fetchElectricityPricesFi(start, end);
        const convertedFiPrices = convertEuromWhToSntKWh(fiPrices); // Convert prices

        // Process the prices to add 'date' property
        const processedFiPrices = processFiElectricityPrices(convertedFiPrices);

        setFiElectricityPrices(processedFiPrices);
        localStorage.setItem('fiElectricityPrices', JSON.stringify(processedFiPrices));
        setErrorFiPrices(null);
      } catch (error) {
        setErrorFiPrices(error.message);
      } finally {
        setLoadingFiPrices(false);
      }
    };

    fetchFiPrices();
  }, [convertEuromWhToSntKWh]);

    /**
   * Effect to compute the current electricity price based on the current time.
   */
    useEffect(() => {
      if (fiElectricityPrices.length > 0) {
        const now = new Date();
  
        const currentPriceEntry = fiElectricityPrices.find((priceEntry) => {
          const priceTime = priceEntry.date; // date is already processed
          const nextHour = new Date(priceTime.getTime() + 3600000); // Add 1 hour
  
          return now >= priceTime && now < nextHour;
        });
  
        setCurrentFiElectricityPrice(currentPriceEntry);
      } else {
        setCurrentFiElectricityPrice(null);
      }
    }, [fiElectricityPrices]);

  // =====================
  // Fetch Electricity Prices from Backend (Converted to snt/kWh)
  // =====================

  const [loadingElectricityPrices, setLoadingElectricityPrices] = useState(true);
  const [errorElectricityPrices, setErrorElectricityPrices] = useState(null);

  useEffect(() => {
    const fetchElectricityPrices = async () => {
      setLoadingElectricityPrices(true);
      try {
        const response = await fetch('http://localhost:5000/api/electricity-prices');
        const result = await response.json();

        // Debugging: Log the API response
        console.log('Electricity Prices API Response:', result);

        if (result.success) {
          const convertedPrices = convertEuromWhToSntKWh(result.data); // Convert prices
          setElectricityPrices(convertedPrices);
          localStorage.setItem('electricityPrices', JSON.stringify(convertedPrices));
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
  }, [convertEuromWhToSntKWh]);

  // =====================
  // Load Existing Electricity Prices from LocalStorage on Mount (Preserved)
  // =====================

  useEffect(() => {
    const storedPrices = JSON.parse(localStorage.getItem('electricityPrices'));
    if (storedPrices) {
      setElectricityPrices(storedPrices);
      setLoadingElectricityPrices(false);
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
  // Generate and Store Control Signals
  // =====================

  useEffect(() => {
    if (heaters.length === 0 || fiElectricityPrices.length === 0) {
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
    const generatedControlSignals = generateControlSignals(heaters, fiElectricityPrices);
    setControlSignals(generatedControlSignals);
    localStorage.setItem('controlSignals', JSON.stringify(generatedControlSignals));
  }, [heaters, fiElectricityPrices]);

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
    setElectricityPrices([]);
    setFiElectricityPrices([]);
    setControlSignals({});
    setCurrentFiElectricityPrice(null);
    setErrorFiPrices(null);
    setErrorElectricityPrices(null);

    // Clear corresponding localStorage entries
    localStorage.removeItem('rooms');
    localStorage.removeItem('heaters');
    localStorage.removeItem('electricityPrices');
    localStorage.removeItem('fiElectricityPrices');
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

        // Electricity Prices State and Functions (snt/kWh)
        electricityPrices,
        setElectricityPrices,

        fiElectricityPrices,
        setFiElectricityPrices,
        loadingFiPrices,
        errorFiPrices,
        currentFiElectricityPrice,

        //Control signals
        controlSignals,
        setControlSignals,

        //Reset
        resetData,

      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
