import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './global.css';
import './App.css';
import FormRoom from './FormRoom';
import DataTable from './DataTable';
import DeviceCards from './DeviceCards';
import InputDataSender from './InputDataSender';
import Layout from './Layout';
import HomeEnergyFlowVisualization from './HomeEnergyFlowVisualization';
import JsonViewer from './JsonViewer';
import generateJsonContent from './generateJsonContent';
import generateProcessesData from './Input_Processes'; // Import generateProcessesData
import ResultCard from './ResultCard';
import FormElectricHeater from './FormElectricHeater'; // Import FormElectricHeater
import HeaterControlDropdown from './HeaterControlDropdown'; // Import HeaterControlDropdown
import TurnOnLightButton from './TurnOnLightButton'; // Import TurnOnLightButton

function App() {
  const [jsonContent, setJsonContent] = useState({});
  const [electricHeaters, setElectricHeaters] = useState([]);
  const [processes, setProcesses] = useState({});
  const [rooms, setRooms] = useState([]);
  const [activeDevices, setActiveDevices] = useState({});
  const [apiKey, setApiKey] = useState(localStorage.getItem('homeAssistantApiKey') || '');
  const [homeAssistantSensors, setHomeAssistantSensors] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  // Set initial active devices based on electric heaters and rooms
  useEffect(() => {
    const initialActiveDevices = {};
    electricHeaters.forEach((heater) => (initialActiveDevices[heater.id] = true));
    rooms.forEach((room) => (initialActiveDevices[room.sensorId] = true));
    setActiveDevices(initialActiveDevices);
  }, [electricHeaters, rooms]);

  // Update jsonContent whenever electricHeaters, rooms, or activeDevices change
  useEffect(() => {
    setJsonContent(generateJsonContent(electricHeaters, rooms, activeDevices));
  }, [electricHeaters, rooms, activeDevices]);

  // Generate processes whenever electric heaters change
  useEffect(() => {
    if (electricHeaters.length > 0) {
      const processData = generateProcessesData(electricHeaters); // Generate process data
      setProcesses(processData); // Set process data state
      console.log('Generated processes:', processData); // Log process data
    }
  }, [electricHeaters]);

  // Save API key to localStorage and trigger fetch when API key is available
  const handleSaveApiKey = () => {
    localStorage.setItem('homeAssistantApiKey', apiKey);
    alert('API Key saved!');
    fetchSensors(); // Trigger fetching of sensors when the API key is saved
  };

  // Fetch sensor data using the API key
  const fetchSensors = async () => {
    if (!apiKey) {
      setError('API key is missing. Please enter your API key.');
      return;
    }
    try {
      const response = await fetch('http://192.168.129.96:8123/api/states', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const sensors = data.filter(entity => entity.entity_id.startsWith('sensor.'));
      setHomeAssistantSensors(sensors);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const addRoom = (room) => {
    const selectedSensorData = homeAssistantSensors.find(sensor => sensor.entity_id === room.sensorId);
    const updatedRoom = {
      ...room,
      sensorState: selectedSensorData ? selectedSensorData.state : 'N/A',
      sensorUnit: selectedSensorData ? selectedSensorData.attributes.unit_of_measurement : '',
    };
    const updatedRooms = [...rooms, updatedRoom];
    setRooms(updatedRooms);
  };

  const addElectricHeater = (heater) => {
    const updatedHeaters = [...electricHeaters, heater];
    setElectricHeaters(updatedHeaters); // Add heater to state
  };

  const deleteHeater = (id) => {
    const updatedHeaters = electricHeaters.filter((heater) => heater.id !== id);
    setElectricHeaters(updatedHeaters);
  };

  const deleteRoom = (sensorId) => {
    const updatedRooms = rooms.filter((room) => room.sensorId !== sensorId);
    setRooms(updatedRooms);
  };

  const toggleDeviceStatus = (id) => {
    setActiveDevices((prevStatus) => ({
      ...prevStatus,
      [id]: !prevStatus[id],
    }));
  };

  return (
    <Router>
      <Layout>
        <div className="device-form">
          <h3>Enter Home Assistant API Key</h3>
          <div className="input-group">
            <label htmlFor="api-key">API Key</label>
            <input
              type="text"
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Home Assistant API Key"
            />
          </div>
          <button onClick={handleSaveApiKey}>Save API Key</button>
          <button onClick={fetchSensors}>Fetch Sensors</button>
          {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
          <ResultCard results={results} />

          {/* Add the TurnOnLightButton component and pass apiKey */}
          <TurnOnLightButton apiKey={apiKey} />
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <div className="app-container">
                <div className="left-side">
                  <h1>Device Data Entry</h1>
                  <FormRoom addRoom={addRoom} homeAssistantSensors={homeAssistantSensors} />
                  <FormElectricHeater addElectricHeater={addElectricHeater} rooms={rooms} apiKey={apiKey} />
                  <HeaterControlDropdown electricHeaters={electricHeaters} apiKey={apiKey} />
                </div>
                <div className="right-side">
                  <InputDataSender jsonContent={jsonContent} />
                </div>
              </div>
            }
          />
          <Route
            path="/device-cards"
            element={
              <div>
                <DeviceCards
                  electricHeaters={electricHeaters}
                  rooms={rooms}
                  activeDevices={activeDevices}
                  toggleDeviceStatus={toggleDeviceStatus}
                />
                <DataTable
                  electricHeaters={electricHeaters}
                  rooms={rooms}
                  homeAssistantSensors={homeAssistantSensors} // Pass sensors to DataTable
                  deleteHeater={deleteHeater}
                  deleteRoom={deleteRoom}
                />
              </div>
            }
          />
          <Route
            path="/processes-graph"
            element={
              <div className="graph-container">
                <h1>Processes Graph</h1>
                <HomeEnergyFlowVisualization processes={processes} /> {/* Pass processes */}
              </div>
            }
          />
          <Route
            path="/json-viewer"
            element={<JsonViewer jsonContent={jsonContent} />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
