// src/pages/ConfigPage.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import finlandLocations from '../utils/finlandLocations';
import styles from './ConfigPage.module.css';
import ConfigContext from '../context/ConfigContext';
// import { useMutation } from '@apollo/client'; // Assuming you're using GraphQL mutations

function ConfigPage() {
  // =====================
  // Configuration Form State
  // =====================
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =====================
  // Selected Material State
  // =====================
  const [selectedMaterial, setSelectedMaterial] = useState('');

  const navigate = useNavigate();

  // =====================
  // Context Consumption
  // =====================
  const {
    updateConfig,
    updateSensors,
    updateDevices,
    materials,
  } = useContext(ConfigContext);

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
  // Handler to Submit Configuration Form
  // =====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Ensure all fields are filled
    if (!country.trim() || !location.trim() || !apiKey.trim() || !selectedMaterial.trim()) {
      setError('All fields, including Material selection, are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/mock-homeassistant/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update configuration state in context, including selectedMaterial
        updateConfig({
          isConfigured: true,
          country: country.trim(),
          location: location.trim(),
          apiKey: apiKey.trim(),
          selectedMaterial: selectedMaterial.trim(),
        });

        // Fetch sensors and devices data
        await fetchHomeAssistantData();

        // Redirect to Dashboard or desired page
        navigate('/');
      } else {
        throw new Error(result.error || 'Unknown error occurred.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.configPageContainer}>
      <h1>Welcome to Hertta Add-on</h1>
      <p>Please complete the following configuration to get started.</p>
      <form onSubmit={handleSubmit} className={styles.configForm}>
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
          <input
            type="text"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Home Assistant API Key"
            required
          />
        </div>

        {/* =====================
             Material Selection Section
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
        <button type="submit" disabled={loading}>
          {loading ? 'Configuring...' : 'Save and Continue'}
        </button>
      </form>
    </div>
  );
}

export default ConfigPage;
