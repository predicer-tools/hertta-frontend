// src/context/ConfigContext.js

import React, { createContext, useState, useEffect } from 'react';

// Create the ConfigContext
const ConfigContext = createContext();

// ConfigProvider component to wrap around parts of the app that need access to the config
export const ConfigProvider = ({ children }) => {
  // =====================
  // Configuration State
  // =====================
  
  // Determines if the application has been configured
  const [isConfigured, setIsConfigured] = useState(() => {
    return localStorage.getItem('isConfigured') === 'true';
  });

  // Stores the configuration details
  const [config, setConfig] = useState({
    country: localStorage.getItem('country') || '',
    location: localStorage.getItem('location') || '',
    apiKey: localStorage.getItem('apiKey') || '',
  });

  // =====================
  // Materials State
  // =====================

  // Stores the list of materials
  const [materials, setMaterials] = useState(() => {
    const storedMaterials = localStorage.getItem('materials');
    if (storedMaterials) {
      try {
        return JSON.parse(storedMaterials);
      } catch (error) {
        console.error('Error parsing materials from localStorage:', error);
        // If parsing fails, initialize with default materials
      }
    }
    // Default materials
    return [
      { name: 'Kevytrakenteinen', value: 40 / 1000 },
      { name: 'Keskiraskas I', value: 70 / 1000 },
      { name: 'Keskiraskas II', value: 110 / 1000 },
      { name: 'Raskasrakenteinen', value: 200 / 1000 },
    ];
  });

  // =====================
  // Sensors and Devices State
  // =====================
  
  // Stores the fetched sensors from Home Assistant
  const [sensors, setSensors] = useState(() => {
    return JSON.parse(localStorage.getItem('homeAssistantSensors')) || [];
  });

  // Stores the fetched devices from Home Assistant
  const [devices, setDevices] = useState(() => {
    return JSON.parse(localStorage.getItem('fetchedDevices')) || [];
  });

  // =====================
  // Persist Configuration to LocalStorage
  // =====================
  
  useEffect(() => {
    localStorage.setItem('isConfigured', isConfigured ? 'true' : 'false');
    localStorage.setItem('country', config.country);
    localStorage.setItem('location', config.location);
    localStorage.setItem('apiKey', config.apiKey);
  }, [isConfigured, config]);

  // =====================
  // Persist Materials to LocalStorage
  // =====================
  
  useEffect(() => {
    localStorage.setItem('materials', JSON.stringify(materials));
  }, [materials]);

  // =====================
  // Persist Sensors and Devices to LocalStorage
  // =====================
  
  useEffect(() => {
    localStorage.setItem('homeAssistantSensors', JSON.stringify(sensors));
  }, [sensors]);

  useEffect(() => {
    localStorage.setItem('fetchedDevices', JSON.stringify(devices));
  }, [devices]);

  // =====================
  // Functions to Update Configuration, Sensors, and Devices
  // =====================

  /**
   * Updates the configuration state.
   * @param {Object} newConfig - Partial configuration to update.
   * Example: { isConfigured: true, country: 'Finland' }
   */
  const updateConfig = (newConfig) => {
    if (newConfig.isConfigured !== undefined) {
      setIsConfigured(newConfig.isConfigured);
    }

    setConfig((prev) => ({
      country: newConfig.country || prev.country,
      location: newConfig.location || prev.location,
      apiKey: newConfig.apiKey || prev.apiKey,
    }));
  };

  /**
   * Updates the sensors state with new sensors data.
   * @param {Array} newSensors - Array of sensor objects.
   */
  const updateSensors = (newSensors) => {
    setSensors(newSensors);
  };

  /**
   * Updates the devices state with new devices data.
   * @param {Array} newDevices - Array of device objects.
   */
  const updateDevices = (newDevices) => {
    setDevices(newDevices);
  };

  /**
   * Updates an existing material in the materials list.
   * @param {number} index - The index of the material to update.
   * @param {Object} updatedMaterial - The updated material object.
   */
  const updateMaterial = (index, updatedMaterial) => {
    setMaterials((prevMaterials) =>
      prevMaterials.map((mat, idx) => (idx === index ? updatedMaterial : mat))
    );
  };

  // =====================
  // Function to Reset All Configuration, Sensors, and Devices
  // =====================

  /**
   * Resets the entire configuration, including sensors and devices.
   * Clears relevant localStorage entries and resets state to initial values.
   */
  const resetConfig = () => {
    // Clear specific localStorage items
    localStorage.removeItem('isConfigured');
    localStorage.removeItem('country');
    localStorage.removeItem('location');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('homeAssistantSensors');
    localStorage.removeItem('fetchedDevices');
    localStorage.removeItem('materials');

    // Reset state
    setIsConfigured(false);
    setConfig({
      country: '',
      location: '',
      apiKey: '',
    });
    setSensors([]);
    setDevices([]);
    setMaterials([
      { name: 'Kevytrakenteinen', value: 40 / 1000 },
      { name: 'Keskiraskas I', value: 70 / 1000 },
      { name: 'Keskiraskas II', value: 110 / 1000 },
      { name: 'Raskasrakenteinen', value: 200 / 1000 },
    ]);
  };

  // =====================
  // Provider's Value
  // =====================
  
  return (
    <ConfigContext.Provider
      value={{
        // Configuration State and Updaters
        isConfigured,
        config,
        updateConfig,

        // Sensors State and Updaters
        sensors,
        updateSensors,

        // Devices State and Updaters
        devices,
        updateDevices,

        // Materials State and Updaters
        materials,
        updateMaterial,

        // Reset Function
        resetConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext;
