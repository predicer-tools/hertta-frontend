// src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import FormRoom from './FormRoom';
import DataTable from './DataTable';
import Layout from './Layout';
import HomeEnergyFlowVisualization from './HomeEnergyFlowVisualization';
import JsonViewer from './JsonViewer';
import generateJsonContent from './generateJsonContent';
import generateProcessesData from './Input_Processes';
import FormElectricHeater from './FormElectricHeater';
import DeviceCards from './DeviceCards';
import connectWebSocket from './homeAssistantWebSocket';
import SendInputData from './SendInputData'; // Import the modified component
import ControlSignalsPopup from './ControlSignalsPopup'; // Import the new popup component
import { generateControlSignals } from './utils/generateControlSignals'; // Import the utility function

function App() {
  const [jsonContent, setJsonContent] = useState({});
  const [electricHeaters, setElectricHeaters] = useState([]);
  const [processes, setProcesses] = useState({});
  const [rooms, setRooms] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('homeAssistantApiKey') || '');
  const [homeAssistantSensors, setHomeAssistantSensors] = useState([]);
  const [fetchedDevices, setFetchedDevices] = useState([]);
  const [activeDevices, setActiveDevices] = useState({});
  const [error, setError] = useState(null);
  const [message] = useState('');

  // State for the control signals popup
  const [isControlPopupOpen, setIsControlPopupOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [controlSignals, setControlSignals] = useState([]);

  // New State: User-Defined Heating Devices
  const [userHeatingDevices, setUserHeatingDevices] = useState([]);

  // Generate the JSON content whenever relevant states change
  useEffect(() => {
    const sensorStates = rooms.reduce((acc, room) => {
      acc[room.sensorId] = room.sensorState !== undefined && room.sensorState !== null ? room.sensorState : 'N/A';
      return acc;
    }, {});

    const generatedJson = generateJsonContent(electricHeaters, rooms, activeDevices, sensorStates);
    setJsonContent(generatedJson);
  }, [electricHeaters, rooms, activeDevices]);

  // Update processes data when electric heaters change
  useEffect(() => {
    if (electricHeaters.length > 0) {
      const processData = generateProcessesData(electricHeaters);
      setProcesses(processData);
      console.log('Generated Processes:', processData); // Debugging
    } else {
      setProcesses({}); // Clear processes if no heaters
      console.log('No heating devices present.');
    }
  }, [electricHeaters]);

  // Handle updates for sensor and device state changes
  const handleEntityUpdate = useCallback((entityId, newState) => {
    if (entityId.startsWith('sensor.')) {
      // Handle sensor updates
      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.sensorId === entityId) {
            return { ...room, sensorState: newState.state, sensorUnit: newState.attributes.unit_of_measurement };
          }
          return room;
        })
      );

      // Update the jsonContent with the new sensor state
      setJsonContent((prevData) => {
        if (!prevData.nodes) return prevData;
        const updatedNodes = { ...prevData.nodes };

        Object.keys(updatedNodes).forEach((nodeKey) => {
          if (nodeKey.startsWith(entityId)) {
            updatedNodes[nodeKey].state.initial_state = parseFloat(newState.state);
          }
        });

        return { ...prevData, nodes: updatedNodes };
      });
    } else {
      // Handle device updates
      // Update fetchedDevices
      setFetchedDevices((prevDevices) =>
        prevDevices.map((device) => {
          if (device.entity_id === entityId) {
            return { ...device, state: newState.state };
          }
          return device;
        })
      );

      // Update activeDevices based on the device's new state
      setActiveDevices((prevStatus) => ({
        ...prevStatus,
        [entityId]: newState.state === 'on', // Assuming 'on' signifies active
      }));

      // Optionally, update jsonContent if devices are part of it
      setJsonContent((prevData) => {
        if (!prevData.nodes) return prevData;
        const updatedNodes = { ...prevData.nodes };

        Object.keys(updatedNodes).forEach((nodeKey) => {
          if (nodeKey === entityId) {
            updatedNodes[nodeKey].status = newState.state === 'on' ? 'on' : 'off';
          }
        });

        return { ...prevData, nodes: updatedNodes };
      });
    }
  }, []);

  // Establish WebSocket connection on apiKey change
  useEffect(() => {
    if (apiKey) {
      const disconnect = connectWebSocket(apiKey, handleEntityUpdate);
      // Clean up the connection on component unmount or apiKey change
      return () => {
        disconnect();
      };
    }
  }, [apiKey, handleEntityUpdate]);

  const handleSaveApiKey = () => {
    localStorage.setItem('homeAssistantApiKey', apiKey);
    alert('API Key saved!');
  };

  const fetchAllDevicesAndSensors = async () => {
    if (!apiKey) {
      setError('API key is missing. Please enter your API key.');
      return;
    }
    try {
      const response = await fetch('http://192.168.247.96:8123/api/states', {
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
      const nonSensorDevices = data.filter(entity => !entity.entity_id.startsWith('sensor.'));

      setHomeAssistantSensors(sensors);
      setFetchedDevices(nonSensorDevices);

      // Initialize activeDevices based on device states
      const initialActiveDevices = {};
      nonSensorDevices.forEach(device => {
        initialActiveDevices[device.entity_id] = device.state === 'on'; // Assuming 'on' signifies active
      });
      setActiveDevices(initialActiveDevices);

      setError(null);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError(error.message);
    }
  };

  const addRoom = (room) => {
    const selectedSensorData = homeAssistantSensors.find(sensor => sensor.entity_id === room.sensorId);
    const updatedRoom = {
      ...room,
      sensorState: selectedSensorData ? selectedSensorData.state : 'N/A',
      sensorUnit: selectedSensorData ? selectedSensorData.attributes.unit_of_measurement : '°C', // Default to '°C' if missing
    };
    setRooms([...rooms, updatedRoom]);

    setActiveDevices((prevStatus) => ({
      ...prevStatus,
      [room.sensorId]: true,
    }));
  };

  const addElectricHeater = (heater) => {
    setElectricHeaters([...electricHeaters, heater]);
    setActiveDevices((prevStatus) => ({
      ...prevStatus,
      [heater.id]: true,
    }));
    // Update userHeatingDevices
    setUserHeatingDevices([...userHeatingDevices, heater.id]);
  };

  const deleteRoom = (sensorId) => {
    const updatedRooms = rooms.filter((room) => room.sensorId !== sensorId);
    setRooms(updatedRooms);
  };

  const deleteHeater = (id) => {
    const updatedHeaters = electricHeaters.filter((heater) => heater.id !== id);
    setElectricHeaters(updatedHeaters);
    setUserHeatingDevices(userHeatingDevices.filter(deviceId => deviceId !== id));
    setActiveDevices((prevStatus) => {
      const updatedStatus = { ...prevStatus };
      delete updatedStatus[id];
      return updatedStatus;
    });
  };

  const toggleDeviceStatus = (id) => {
    setActiveDevices((prevStatus) => ({
      ...prevStatus,
      [id]: !prevStatus[id],
    }));
  };

  // Function to handle when a device is clicked to show control signals
  const handleDeviceClick = (device) => { // Updated to accept device object
    console.log('Device clicked:', device); // Debugging: Log the device object
    setSelectedDevice(device.id); // Extract and set the device ID as a string
    const signals = generateControlSignals(); // Generate mock control signals
    setControlSignals(signals);
    setIsControlPopupOpen(true);
  };

  return (
    <Layout>
      <Routes>
        {/* Visualization as Home Page */}
        <Route
          path="/"
          element={
            <div className="graph-container">
              <h1>Processes Graph</h1>
              <HomeEnergyFlowVisualization
                processes={processes} // Ensure processes are passed
                rooms={rooms}
                activeDevices={activeDevices} // Pass activeDevices
                onDeviceClick={handleDeviceClick} // Pass the device click handler
                userHeatingDevices={userHeatingDevices} // Pass the user-defined heating devices
              />
              {/* Include the control signals popup component */}
              <ControlSignalsPopup
                isOpen={isControlPopupOpen}
                onClose={() => setIsControlPopupOpen(false)}
                deviceId={selectedDevice}
                controlSignals={controlSignals}
              />
            </div>
          }
        />

        {/* Input Data Forms Route */}
        <Route
          path="/input-data"
          element={
            <div className="app-container">
              <div className="left-side">
                <h1>Device Data Entry</h1>
                {/* API Key Input and Forms */}
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
                  <div className="button-group">
                    <button onClick={handleSaveApiKey}>Save API Key</button>
                    <button onClick={fetchAllDevicesAndSensors}>Fetch Sensors and Devices</button>
                  </div>
                  {error && (
                    <p className="error-message">
                      <strong>Error:</strong> {error}
                    </p>
                  )}
                </div>

                {/* Forms for Room and Electric Heater */}
                <FormRoom addRoom={addRoom} homeAssistantSensors={homeAssistantSensors} />
                <FormElectricHeater
                  addElectricHeater={addElectricHeater}
                  rooms={rooms}
                  fetchedDevices={fetchedDevices}
                />
              </div>
              <div className="right-side">
                {/* Include the SendInputData component and pass jsonContent */}
                <SendInputData jsonContent={jsonContent} />
                {message && <p>{message}</p>}
              </div>
            </div>
          }
        />

        {/* Other Routes */}
        <Route
          path="/device-cards"
          element={
            <div>
              <DataTable
                electricHeaters={electricHeaters}
                rooms={rooms}
                homeAssistantSensors={homeAssistantSensors}
                fetchedDevices={fetchedDevices}
                deleteHeater={deleteHeater}
                deleteRoom={deleteRoom}
              />
            </div>
          }
        />
        <Route
          path="/json-viewer"
          element={<JsonViewer jsonContent={jsonContent} />}
        />
        <Route
          path="/electric-heaters"
          element={
            <DeviceCards
              electricHeaters={electricHeaters}
              rooms={rooms}
              activeDevices={activeDevices}
              toggleDeviceStatus={toggleDeviceStatus}
              apiKey={apiKey}
            />
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
