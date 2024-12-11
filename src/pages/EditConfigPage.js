// src/pages/EditConfigPage.js

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import finlandLocations from '../utils/finlandLocations';
import ConfigContext from '../context/ConfigContext';
import styles from './ConfigPage.module.css';

function EditConfigPage() {
  // =====================
  // Configuration Form State
  // =====================
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [showApiKey, setShowApiKey] = useState(false); // State to toggle API key visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // =====================
  // Context Consumption
  // =====================
  const {
    updateConfig,
    updateSensors,
    updateDevices,
    materials,
    config, // Access current configuration
  } = useContext(ConfigContext);

  // =====================
  // Initialize Form with Existing Config
  // =====================
  useEffect(() => {
    setCountry(config.country);
    setLocation(config.location);
    // Do not pre-fill API Key to keep it hidden
    setApiKey(''); // Initialize as empty
    setSelectedMaterial(config.selectedMaterial);
  }, [config]);

  // =====================
  // Function to Fetch Home Assistant Data
  // =====================
  const fetchHomeAssistantData = async () => {
    try {
      const sensorsResponse = await fetch('http://localhost:5000/mock-homeassistant/sensors');
      const devicesResponse = await fetch('http://localhost:5000/mock-homeassistant/devices');

      if (!sensorsResponse.ok || !devicesResponse.ok) {
        throw new Error('Failed to fetch data from Home Assistant.');
      }

      const sensors = await sensorsResponse.json();
      const devices = await devicesResponse.json();

      // Update ConfigContext with sensors and devices
      updateSensors(sensors);
      updateDevices(devices);
    } catch (err) {
      console.error('Error fetching Home Assistant data:', err);
      throw err; // Re-throw to handle in handleSubmit
    }
  };

  // =====================
  // Handler to Submit Edit Configuration Form
  // =====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Ensure required fields are filled
    if (!country.trim() || !location.trim() || !selectedMaterial.trim()) {
      setError('Country, Location, and Material selection are required.');
      return;
    }

    // If updating API Key, ensure it's provided
    if (apiKey.trim() && apiKey.trim().length < 8) { // Example validation: min length
      setError('API Key must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare new configuration object
      const newConfig = {
        isConfigured: true, // Ensure this remains true
        country: country.trim(),
        location: location.trim(),
        selectedMaterial: selectedMaterial.trim(),
      };

      // Conditionally include API Key if a new one is provided
      if (apiKey.trim()) {
        newConfig.apiKey = apiKey.trim();
      } else {
        newConfig.apiKey = config.apiKey; // Retain existing API Key
      }

      // Update configuration state in context
      updateConfig(newConfig);

      // Optionally, re-fetch sensors and devices if API key or other critical info changed
      if (apiKey.trim()) {
        await fetchHomeAssistantData();
      }

      // Redirect to Dashboard or desired page
      navigate('/');
    } catch (err) {
      setError(err.message || 'An error occurred while updating the configuration.');
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // Handler to Toggle API Key Visibility
  // =====================
  const toggleShowApiKey = () => {
    setShowApiKey((prev) => !prev);
  };

  return (
    <div className={styles.editConfigPageContainer}>
      <h1>Edit Configuration</h1>
      <p>Update your configuration settings below.</p>
      <form onSubmit={handleSubmit} className={styles.editConfigForm}>
        {/* =====================
             Country Selection
             ===================== */}
        <div className={styles.formGroup}>
          <label htmlFor="country">Country:</label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          >
            <option value="">Select Country</option>
            <option value="Finland">Finland</option>
            {/* Add more countries as needed */}
          </select>
        </div>

        {/* =====================
             Location Selection
             ===================== */}
        <div className={styles.formGroup}>
          <label htmlFor="location">Location:</label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            disabled={!country}
          >
            <option value="">Select Location</option>
            {finlandLocations.map((loc, index) => (
              <option key={index} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* =====================
             API Key Input
             ===================== */}
        <div className={styles.formGroup}>
          <label htmlFor="apiKey">Home Assistant API Key:</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showApiKey ? 'text' : 'password'}
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={apiKey ? '' : 'Enter a new API Key (leave blank to keep existing)'}
              className={styles.passwordInput}
            />
            <button
              type="button"
              onClick={toggleShowApiKey}
              className={styles.showHideButton}
              aria-label={showApiKey ? 'Hide API Key' : 'Show API Key'}
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <small className={styles.helperText}>
            Leave blank to retain your existing API Key.
          </small>
        </div>

        {/* =====================
             Material Selection Dropdown
             ===================== */}
        <div className={styles.formGroup}>
          <label htmlFor="material">Select Material:</label>
          <select
            id="material"
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            required
          >
            <option value="">Select Material</option>
            {materials.map((material, index) => (
              <option key={index} value={material.name}>
                {material.name} ({material.value * 1000} W/m³)
              </option>
            ))}
          </select>
        </div>

        {/* =====================
             Display Error Messages
             ===================== */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* =====================
             Submit Button
             ===================== */}
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Updating...' : 'Update Configuration'}
        </button>
      </form>
    </div>
  );
}

export default EditConfigPage;
