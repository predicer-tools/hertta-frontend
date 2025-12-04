import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import finlandLocations from '../utils/finlandLocations';
import { materialInfo } from '../utils/materialInfo';
import styles from './ConfigPage.module.css';
import ConfigContext from '../context/ConfigContext';
import Modal from '../components/Modal/Modal';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Base URL for the Home Assistant API.  Replace with your actual HA IP/host.
const HA_BASE_URL = process.env.REACT_APP_HA_BASE_URL;

function ConfigPage() {
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [isMaterialInfoOpen, setIsMaterialInfoOpen] = useState(false);

  const navigate = useNavigate();
  const { updateConfig, updateSensors, updateDevices } = useContext(ConfigContext);

  // Helper to fetch all entity states and separate sensors/devices.
  const fetchHomeAssistantData = async () => {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(`${HA_BASE_URL}states`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch entity states from Home Assistant.');
      }
      const states = await response.json();

      // Filter sensors and other devices by domain prefix.
      const sensors = states.filter((s) => s.entity_id.startsWith('sensor.'));
      const devices = states.filter((s) =>
        // pick some common device domains: light, switch, climate, etc.
        /(light|switch|climate|fan|media_player)\./.test(s.entity_id)
      );

      updateSensors(sensors);
      updateDevices(devices);
    } catch (err) {
      console.error('Error fetching Home Assistant data:', err);
      throw err;
    }
  };

  // Form submission handler.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!country.trim() || !location.trim() || !apiKey.trim() || !selectedMaterial.trim()) {
      setError('All fields, including Material selection, are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ping the API root to ensure the API is reachable and the token works.
      const pingResponse = await fetch(HA_BASE_URL, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      const pingResult = await pingResponse.json();
      if (pingResponse.ok && pingResult.message === 'API running.') {
        updateConfig({
          isConfigured: true,
          country: country.trim(),
          location: location.trim(),
          apiKey: apiKey.trim(),
          selectedMaterial: selectedMaterial.trim(),
        });

        await fetchHomeAssistantData();
        navigate('/');
      } else {
        throw new Error('Failed to connect to Home Assistant. Check your API key and URL.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMaterialInfo = () => setIsMaterialInfoOpen(true);
  const handleCloseMaterialInfo = () => setIsMaterialInfoOpen(false);

  return (
    <div className={styles.configPageContainer}>
      <h1>Welcome to Hertta Add-on</h1>
      <p>Please complete the following configuration to get started.</p>
      <form onSubmit={handleSubmit} className={styles.configForm}>
        {/* Country selection */}
        <div className={styles.formGroup}>
          <label htmlFor="country">Country:</label><br />
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
        {/* Location selection */}
        <div className={styles.formGroup}>
          <label htmlFor="location">Location:</label><br />
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            disabled={!country}
          >
            <option value="">Select Location</option>
            {finlandLocations.map((loc, index) => (
              <option key={index} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        {/* API key input */}
        <div className={styles.formGroup}>
          <label htmlFor="apiKey">Home Assistant API Key:</label><br />
          <input
            type="text"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your long‑lived access token"
            required
          />
        </div>
        {/* Material selection */}
        <div className={styles.formGroup}>
          <label htmlFor="material">
            Select Material:
            <InfoOutlinedIcon
              onClick={handleOpenMaterialInfo}
              style={{ marginLeft: '10px', cursor: 'pointer' }}
              aria-label="More info about materials"
            />
          </label><br />
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

        {/* Display errors */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Submit button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Configuring...' : 'Save and Continue'}
        </button>
      </form>

      {/* Modal for material info */}
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

export default ConfigPage;
