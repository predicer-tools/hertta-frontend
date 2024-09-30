import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './global.css';
import './App.css';
import FormRoom from './FormRoom';
import FormElectricHeater from './FormElectricHeater';
import DataTable from './DataTable';
import DeviceCards from './DeviceCards';
import InputDataSender from './InputDataSender';
import Layout from './Layout';
import HomeEnergyFlowVisualization from './HomeEnergyFlowVisualization';
import JsonViewer from './JsonViewer';
import { fetchSensorsFromHomeAssistant } from './services/HomeAssistantInterface';
import generateJsonContent from './generateJsonContent';
import VisualizationGraph from './VisualizationGraph';


function App() {
  const [jsonContent, setJsonContent] = useState({});
  const [electricHeaters, setElectricHeaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeDevices, setActiveDevices] = useState({});
  const [apiKey, setApiKey] = useState(localStorage.getItem('homeAssistantApiKey') || '');
  const [homeAssistantSensors, setHomeAssistantSensors] = useState([]);

  useEffect(() => {
    const initialActiveDevices = {};
    electricHeaters.forEach((heater) => (initialActiveDevices[heater.id] = true));
    rooms.forEach((room) => (initialActiveDevices[room.sensorId] = true));
    setActiveDevices(initialActiveDevices);
  }, [electricHeaters, rooms]);

  useEffect(() => {
    setJsonContent(generateJsonContent(electricHeaters, rooms, activeDevices));
  }, [electricHeaters, rooms, activeDevices]);

  const handleSaveApiKey = () => {
    localStorage.setItem('homeAssistantApiKey', apiKey);
    alert('API Key saved!');
  };

  const fetchSensors = async () => {
    try {
      if (!apiKey) {
        alert('Please enter an API key');
        return;
      }

      const sensors = await fetchSensorsFromHomeAssistant(apiKey);
      setHomeAssistantSensors(sensors);

      if (sensors.length === 0) {
        console.warn('No sensors were fetched from Home Assistant.');
      }
    } catch (error) {
      console.error('Failed to fetch sensors:', error);
    }
  };

  const addRoom = (room) => {
    // Find the sensor data from the fetched sensors based on the selected sensor ID
    const selectedSensorData = homeAssistantSensors.find(sensor => sensor.entity_id === room.sensorId);
  
    // Add the sensor state and unit to the room object
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
    setElectricHeaters(updatedHeaters);
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
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <div className="app-container">
                <div className="left-side">
                  <h1>Device Data Entry</h1>
                  <FormRoom addRoom={addRoom} homeAssistantSensors={homeAssistantSensors} />
                  <FormElectricHeater addElectricHeater={addElectricHeater} rooms={rooms} />
                </div>
                <div className="right-side">
                  <InputDataSender jsonContent={jsonContent} />
                </div>
              </div>
            }
          />
          <Route
            path="/data-table"
            element={
              <DataTable
                electricHeaters={electricHeaters}
                rooms={rooms}
                homeAssistantSensors={homeAssistantSensors}
                deleteHeater={deleteHeater}
                deleteRoom={deleteRoom}
              />
            }
          />
          <Route
            path="/device-cards"
            element={
              <DeviceCards
                electricHeaters={electricHeaters}
                rooms={rooms}
                activeDevices={activeDevices}
                toggleDeviceStatus={toggleDeviceStatus}
              />
            }
          />
          <Route
            path="/processes-graph"
            element={
              <div className="graph-container">
                <h1>Processes Graph</h1>
                <HomeEnergyFlowVisualization processes={jsonContent.processes || {}} />
              </div>
            }
          />
          <Route
            path="/json-viewer"
            element={<JsonViewer jsonContent={jsonContent} />}
          />
          <Route
            path="/visualization-graph"
            element={
              <VisualizationGraph
                rooms={rooms}
                electricHeaters={electricHeaters}
                processes={jsonContent.processes || {}} // Pass processes data
              />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
