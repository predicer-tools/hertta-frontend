// src/pages/ConfigPage.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import finlandLocations from '../utils/finlandLocations';
import styles from './ConfigPage.module.css';
import ConfigContext from '../context/ConfigContext';

function ConfigPage() {
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { updateConfig, updateSensors, updateDevices } = useContext(ConfigContext);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!country.trim() || !location.trim() || !apiKey.trim()) {
      setError('All fields are required.');
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
        // Update configuration state
        updateConfig({
          isConfigured: true,
          country: country.trim(),
          location: location.trim(),
          apiKey: apiKey.trim(),
        });

        // Fetch sensors and devices
        await fetchHomeAssistantData();

        // Redirect to Dashboard
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
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Configuring...' : 'Save and Continue'}
        </button>
      </form>
    </div>
  );
}

export default ConfigPage;
