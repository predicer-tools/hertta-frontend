// src/context/ConfigContext.js

import React, { createContext, useState, useEffect } from 'react';
import { applyDefaultModelSetup } from '../graphql/configActions';

const HASS_BACKEND_URL = 'http://localhost:4001';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {

  // =====================
  // Sync API key to backend on first load
  // =====================
  useEffect(() => {
    if (config.apiKey) {
      void sendApiKeyToBackend(config.apiKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================
  // Configuration State
  // =====================

  const [isConfigured, setIsConfigured] = useState(() => {
    return localStorage.getItem('isConfigured') === 'true';
  });

  const [config, setConfig] = useState({
    country: localStorage.getItem('country') || '',
    location: localStorage.getItem('location') || '',
    apiKey: localStorage.getItem('apiKey') || '',
    selectedMaterial: localStorage.getItem('selectedMaterial') || '',
  });

  // =====================
  // Materials State
  // =====================

  const [materials, setMaterials] = useState(() => {
    const storedMaterials = localStorage.getItem('materials');
    if (storedMaterials) {
      try {
        return JSON.parse(storedMaterials);
      } catch (error) {
        console.error('Error parsing materials from localStorage:', error);
      }
    }
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

  const [sensors, setSensors] = useState(() => {
    return JSON.parse(localStorage.getItem('homeAssistantSensors')) || [];
  });

  const [devices, setDevices] = useState(() => {
    return JSON.parse(localStorage.getItem('fetchedDevices')) || [];
  });

  // =====================
  // Persistence
  // =====================

  useEffect(() => {
    localStorage.setItem('isConfigured', isConfigured ? 'true' : 'false');
    localStorage.setItem('country', config.country);
    localStorage.setItem('location', config.location);
    localStorage.setItem('apiKey', config.apiKey);
    localStorage.setItem('selectedMaterial', config.selectedMaterial);
  }, [isConfigured, config]);

  useEffect(() => {
    localStorage.setItem('materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('homeAssistantSensors', JSON.stringify(sensors));
  }, [sensors]);

  useEffect(() => {
    localStorage.setItem('fetchedDevices', JSON.stringify(devices));
  }, [devices]);

  const sendApiKeyToBackend = async (apiKey) => {
    if (!apiKey) return;

    try {
      const resp = await fetch(`${HASS_BACKEND_URL}/set-ha-api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
      });

      if (!resp.ok) {
        console.error('Failed to send HA API key to backend:', resp.status);
      } else {
        const data = await resp.json().catch(() => ({}));
        console.log('Backend /set-ha-api-key response:', data);
      }
    } catch (err) {
      console.error('Error calling /set-ha-api-key:', err);
    }
  };


  // =====================
  // Updaters
  // =====================

  /**
   * Updates the configuration state.
   * If config flips from false -> true, also applies the default model setup
   * and sends the device location (country/place) at the same time.
   */

  const updateConfig = (newConfig) => {

    const nextConfig = {
      country: newConfig.country ?? config.country,
      location: newConfig.location ?? config.location,
      apiKey: newConfig.apiKey ?? config.apiKey,
      selectedMaterial: newConfig.selectedMaterial ?? config.selectedMaterial,
    };

    const flippingToConfigured =
      newConfig.isConfigured === true && !isConfigured;

    if (flippingToConfigured) {
      const hasLocation =
        nextConfig.country?.trim() && nextConfig.location?.trim();

      applyDefaultModelSetup(
        hasLocation
          ? {
              country: nextConfig.country.trim(),
              place: nextConfig.location.trim(),
            }
          : undefined
      ).catch((e) => {
        console.error('Failed to apply default model setup:', e);
      });

      setIsConfigured(true);
    } else if (newConfig.isConfigured === false && isConfigured) {
      setIsConfigured(false);
    }

    // Detect if apiKey changed
    const apiKeyChanged =
      nextConfig.apiKey && nextConfig.apiKey !== config.apiKey;

    setConfig(nextConfig);

    if (apiKeyChanged) {
      // fire-and-forget call to backend
      void sendApiKeyToBackend(nextConfig.apiKey);
    }
  };


  const updateSensors = (newSensors) => {
    setSensors(newSensors);
  };

  const updateDevices = (newDevices) => {
    setDevices(newDevices);
  };

  const updateMaterial = (index, updatedMaterial) => {
    setMaterials((prev) =>
      prev.map((mat, idx) => (idx === index ? updatedMaterial : mat))
    );
  };

  // =====================
  // Reset
  // =====================

  const resetConfig = () => {
    localStorage.removeItem('isConfigured');
    localStorage.removeItem('country');
    localStorage.removeItem('location');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('homeAssistantSensors');
    localStorage.removeItem('fetchedDevices');
    localStorage.removeItem('materials');

    setIsConfigured(false);
    setConfig({
      country: '',
      location: '',
      apiKey: '',
      selectedMaterial: '',
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
  // Provider
  // =====================

  const contextValue = {
    isConfigured,
    config,
    updateConfig,

    sensors,
    updateSensors,

    devices,
    updateDevices,

    materials,
    updateMaterial,

    resetConfig,

    getLocation: () => config.location,
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext;
