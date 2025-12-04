import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import finlandLocations from '../utils/finlandLocations';
import { materialInfo } from '../utils/materialInfo'; // Import materialInfo
import ConfigContext from '../context/ConfigContext';
import styles from './ConfigPage.module.css';
import Modal from '../components/Modal/Modal';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function EditConfigPage() {
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isMaterialInfoOpen, setIsMaterialInfoOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const {
    updateConfig,
    updateSensors,
    updateDevices,
    config, // Access current configuration
  } = useContext(ConfigContext);

  useEffect(() => {
    setCountry(config.country);
    setLocation(config.location);
    setApiKey(''); // Do not pre-fill API Key for security
    setSelectedMaterial(config.selectedMaterial);
  }, [config]);

  const fetchHomeAssistantData = async () => {
    try {
      const sensorsResponse = await fetch('http://localhost:5000/mock-homeassistant/sensors');
      const devicesResponse = await fetch('http://localhost:5000/mock-homeassistant/devices');

      if (!sensorsResponse.ok || !devicesResponse.ok) {
        throw new Error('Failed to fetch data from Home Assistant.');
      }

      const sensors = await sensorsResponse.json();
      const devices = await devicesResponse.json();

      updateSensors(sensors);
      updateDevices(devices);
    } catch (err) {
      console.error('Error fetching Home Assistant data:', err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!country.trim() || !location.trim() || !selectedMaterial.trim()) {
      setError('Country, Location, and Material selection are required.');
      return;
    }

    if (apiKey.trim() && apiKey.trim().length < 8) {
      setError('API Key must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newConfig = {
        isConfigured: true,
        country: country.trim(),
        location: location.trim(),
        selectedMaterial: selectedMaterial.trim(),
        apiKey: apiKey.trim() || config.apiKey, // Use new API Key if provided, otherwise retain the current one
      };

      updateConfig(newConfig);

      if (apiKey.trim()) {
        await fetchHomeAssistantData();
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'An error occurred while updating the configuration.');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowApiKey = () => setShowApiKey((prev) => !prev);
  const handleOpenMaterialInfo = () => setIsMaterialInfoOpen(true);
  const handleCloseMaterialInfo = () => setIsMaterialInfoOpen(false);

  return (
    <div className={styles.editConfigPageContainer}>
      <h1>Edit Configuration</h1>
      <p>Update your configuration settings below.</p>
      <form onSubmit={handleSubmit} className={styles.editConfigForm}>
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

        <div className={styles.formGroup}>
          <label htmlFor="material">
            Select Material:
            <InfoOutlinedIcon
              onClick={handleOpenMaterialInfo}
              style={{ marginLeft: '10px', cursor: 'pointer' }}
              aria-label="More info about materials"
            />
          </label>
          <select
            id="material"
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            required
          >
            <option value="">Select Material</option>
            {materialInfo.map((material, index) => (
              <option key={index} value={material.name}>
                {material.dropdown}
              </option>
            ))}
          </select>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Updating...' : 'Update Configuration'}
        </button>
      </form>

      <Modal isOpen={isMaterialInfoOpen} onClose={handleCloseMaterialInfo}>
        <h2>Material Information</h2>
        <ul>
          {materialInfo.map((material, index) => (
            <li key={index}>
              <strong>{material.name}:</strong> {material.description}
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}

export default EditConfigPage;
