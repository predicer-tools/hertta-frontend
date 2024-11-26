// src/context/DataContext.js
import React, { createContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // State for rooms and heaters
  const [rooms, setRooms] = useState(() => {
    return JSON.parse(localStorage.getItem('rooms')) || [];
  });
  const [heaters, setHeaters] = useState(() => {
    return JSON.parse(localStorage.getItem('heaters')) || [];
  });

  // Persist rooms to localStorage
  useEffect(() => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  }, [rooms]);

  // Persist heaters to localStorage
  useEffect(() => {
    localStorage.setItem('heaters', JSON.stringify(heaters));
  }, [heaters]);

  // Function to add a new room
  const addRoom = (newRoom) => {
    setRooms((prevRooms) => [...prevRooms, newRoom]);
  };

  // Function to delete a room
  const deleteRoom = (roomId) => {
    setRooms((prevRooms) => prevRooms.filter((room) => room.roomId !== roomId));
  };

  // Function to add a new electric heater
  const addElectricHeater = (newHeater) => {
    setHeaters((prevHeaters) => [...prevHeaters, newHeater]);
  };

  // Function to delete a heater
  const deleteHeater = (heaterId) => {
    setHeaters((prevHeaters) => prevHeaters.filter((heater) => heater.id !== heaterId));
  };

  return (
    <DataContext.Provider
      value={{
        rooms,
        heaters,
        addRoom,
        deleteRoom,
        addElectricHeater,
        deleteHeater,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
