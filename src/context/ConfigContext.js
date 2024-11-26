// src/context/ConfigContext.js
import React, { createContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  // Configuration State
  const [isConfigured, setIsConfigured] = useState(() => {
    return localStorage.getItem('isConfigured') === 'true';
  });

  const [config, setConfig] = useState({
    country: localStorage.getItem('country') || '',
    location: localStorage.getItem('location') || '',
    apiKey: localStorage.getItem('apiKey') || '',
  });

  // Sensors and Devices State
  const [sensors, setSensors] = useState(() => {
    return JSON.parse(localStorage.getItem('homeAssistantSensors')) || [];
  });

  const [devices, setDevices] = useState(() => {
    return JSON.parse(localStorage.getItem('fetchedDevices')) || [];
  });

  // Update localStorage when config changes
  useEffect(() => {
    localStorage.setItem('isConfigured', isConfigured ? 'true' : 'false');
    localStorage.setItem('country', config.country);
    localStorage.setItem('location', config.location);
    localStorage.setItem('apiKey', config.apiKey);
  }, [isConfigured, config]);

  // Update localStorage when sensors or devices change
  useEffect(() => {
    localStorage.setItem('homeAssistantSensors', JSON.stringify(sensors));
  }, [sensors]);

  useEffect(() => {
    localStorage.setItem('fetchedDevices', JSON.stringify(devices));
  }, [devices]);

  // Function to update configuration
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

  // Functions to update sensors and devices
  const updateSensors = (newSensors) => {
    setSensors(newSensors);
  };

  const updateDevices = (newDevices) => {
    setDevices(newDevices);
  };

  // **New Function: Reset Configuration**
  const resetConfig = () => {
    // Clear specific localStorage items
    localStorage.removeItem('isConfigured');
    localStorage.removeItem('country');
    localStorage.removeItem('location');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('homeAssistantSensors');
    localStorage.removeItem('fetchedDevices');

    // Reset state
    setIsConfigured(false);
    setConfig({
      country: '',
      location: '',
      apiKey: '',
    });
    setSensors([]);
    setDevices([]);
  };

  return (
    <ConfigContext.Provider
      value={{
        isConfigured,
        config,
        updateConfig,
        sensors,
        devices,
        updateSensors,
        updateDevices,
        resetConfig, // Provide reset function
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext;
