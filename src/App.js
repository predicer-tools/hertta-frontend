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
import FormElectricHeater from './FormElectricHeater';
import DeviceCards from './DeviceCards';
import connectWebSocket from './homeAssistantWebSocket';
import SendInputData from './SendInputData';
import ControlSignalsPopup from './ControlSignalsPopup';
import { generateControlSignals } from './utils/generateControlSignals';
import WeatherForecast from './WeatherForecast'; // Import the WeatherForecast component

function App() {
  const [jsonContent, setJsonContent] = useState({});
  const [rooms, setRooms] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [homeAssistantSensors, setHomeAssistantSensors] = useState([]);
  const [fetchedDevices, setFetchedDevices] = useState([]);
  const [activeDevices, setActiveDevices] = useState({});
  const [error, setError] = useState(null);
  const [message] = useState('');

  // New States: Country and Location Inputs
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [savedCountry, setSavedCountry] = useState('');
  const [savedLocation, setSavedLocation] = useState('');

  // New State: Outside Temperature
  const [outsideTemp, setOutsideTemp] = useState(null); // Initialize as null

  // State for the control signals popup
  const [isControlPopupOpen, setIsControlPopupOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [controlSignals, setControlSignals] = useState([]);

  // New State: User-Defined Heating Devices
  const [userHeatingDevices, setUserHeatingDevices] = useState([]);

  // State to store the disconnect function for WebSocket
  const [webSocketDisconnect, setWebSocketDisconnect] = useState(null);

  // Generate the JSON content whenever relevant states change
  useEffect(() => {
    const sensorStates = rooms.reduce((acc, room) => {
      acc[room.sensorId] =
        room.sensorState !== undefined && room.sensorState !== null
          ? room.sensorState
          : 'N/A';
      return acc;
    }, {});

    // Collect all devices from rooms
    const allDevices = rooms.flatMap((room) => room.devices);

    const generatedJson = generateJsonContent(
      allDevices,
      rooms,
      activeDevices,
      sensorStates
    );
    setJsonContent(generatedJson);
  }, [rooms, activeDevices]);

  // Handle updates for sensor and device state changes
  const handleEntityUpdate = useCallback((entityId, newState) => {
    if (entityId.startsWith('sensor.')) {
      // Handle sensor updates
      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.sensorId === entityId) {
            return {
              ...room,
              sensorState: newState.state,
              sensorUnit: newState.attributes.unit_of_measurement,
            };
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
            updatedNodes[nodeKey].state.initial_state = parseFloat(
              newState.state
            );
          }
        });

        return { ...prevData, nodes: updatedNodes };
      });
    } else {
      // Handle device updates
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
            updatedNodes[nodeKey].status =
              newState.state === 'on' ? 'on' : 'off';
          }
        });

        return { ...prevData, nodes: updatedNodes };
      });
    }
  }, []);

  // Fetch all devices and sensors without any filters
  const fetchAllDevicesAndSensors = async () => {
    if (!apiKey) {
      setError('API key is missing. Please enter your API key.');
      return;
    }
    try {
      const response = await fetch('http://192.168.41.27:8123/api/states', { // Updated URL
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Remove filters: fetch all devices and sensors
      setHomeAssistantSensors(data); // Assuming all entities can be treated as sensors
      setFetchedDevices(data); // And as devices as well

      // Initialize activeDevices based on device states
      const initialActiveDevices = {};
      data.forEach((device) => {
        initialActiveDevices[device.entity_id] = device.state === 'on'; // Assuming 'on' signifies active
      });
      setActiveDevices(initialActiveDevices);

      setError(null);

      // Establish WebSocket connection after successful fetch
      if (webSocketDisconnect) {
        webSocketDisconnect(); // Disconnect previous WebSocket if any
      }
      const disconnect = connectWebSocket(apiKey, handleEntityUpdate);
      setWebSocketDisconnect(() => disconnect);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError(error.message);
    }
  };

  // Clean up the WebSocket connection when the component unmounts
  useEffect(() => {
    return () => {
      if (webSocketDisconnect) {
        webSocketDisconnect();
      }
    };
  }, [webSocketDisconnect]);

  const handleSaveApiKey = () => {
    localStorage.setItem('homeAssistantApiKey', apiKey);
    alert('API Key saved!');
  };

  // New Function: Handle Saving Country and Location
  const handleSaveLocation = () => {
    if (!country.trim() || !location.trim()) {
      setError('Please enter both Country and Location.');
      return;
    }
    setSavedCountry(country.trim());
    setSavedLocation(location.trim());
    localStorage.setItem('country', country.trim());
    localStorage.setItem('location', location.trim());
    alert('Country and Location saved!');
    setError(null);
  };

  // Load saved Country and Location from localStorage on mount
  useEffect(() => {
    const storedCountry = localStorage.getItem('country');
    const storedLocation = localStorage.getItem('location');
    if (storedCountry) {
      setCountry(storedCountry);
      setSavedCountry(storedCountry);
    }
    if (storedLocation) {
      setLocation(storedLocation);
      setSavedLocation(storedLocation);
    }
  }, []);

  // Function to update outsideTemp from WeatherForecast
  const updateOutsideTemp = (temp) => {
    setOutsideTemp(temp);
  };

  // Modify addRoom
  const addRoom = (room) => {
    // Initialize devices array
    const newRoom = { ...room, devices: [] };
    setRooms([...rooms, newRoom]);

    setActiveDevices((prevStatus) => ({
      ...prevStatus,
      [room.sensorId]: true,
    }));
  };

  // Modify addElectricHeater
  const addElectricHeater = (heater) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.roomId === heater.roomId) {
          // Add device to this room's devices array
          return {
            ...room,
            devices: [...room.devices, heater],
          };
        } else {
          return room;
        }
      })
    );

    setActiveDevices((prevStatus) => ({
      ...prevStatus,
      [heater.id]: true,
    }));
    setUserHeatingDevices([...userHeatingDevices, heater.id]);
  };

  // Modify deleteHeater
  const deleteHeater = (heaterId, roomId) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.roomId === roomId) {
          return {
            ...room,
            devices: room.devices.filter((device) => device.id !== heaterId),
          };
        } else {
          return room;
        }
      })
    );
    setUserHeatingDevices(
      userHeatingDevices.filter((deviceId) => deviceId !== heaterId)
    );
    setActiveDevices((prevStatus) => {
      const updatedStatus = { ...prevStatus };
      delete updatedStatus[heaterId];
      return updatedStatus;
    });
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

  // Function to handle when a device is clicked to show control signals
  const handleDeviceClick = (device) => {
    if (!device || !device.id) return;
    setSelectedDevice(device.id);
    const signals = generateControlSignals();
    setControlSignals(signals);
    setIsControlPopupOpen(true);
  };

  return (
    <Layout>
      <Routes>
        {/* Energy Flow Visualization as Home Page */}
        <Route
          path="/"
          element={
            <div className="graph-container">
              <h1>Energy Flow Visualization</h1>
              <HomeEnergyFlowVisualization
                rooms={rooms}
                activeDevices={activeDevices}
                onDeviceClick={handleDeviceClick}
                userHeatingDevices={userHeatingDevices}
                outsideTemp={outsideTemp} // Pass outsideTemp as prop
              />
              {/* Include the control signals popup component */}
              <ControlSignalsPopup
                isOpen={isControlPopupOpen && !!selectedDevice}
                onClose={() => {
                  setSelectedDevice(null);
                  setIsControlPopupOpen(false);
                }}
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
                    <button
                      onClick={fetchAllDevicesAndSensors}
                      disabled={!savedCountry || !savedLocation}
                      title={
                        !savedCountry || !savedLocation
                          ? 'Please save Country and Location first.'
                          : 'Fetch Sensors and Devices'
                      }
                    >
                      Fetch Sensors and Devices
                    </button>
                  </div>
                  {error && (
                    <p className="error-message">
                      <strong>Error:</strong> {error}
                    </p>
                  )}
                </div>

                {/* New Input Fields for Country and Location */}
                <div className="device-form">
                  <h3>Enter Country and Location</h3>
                  <div className="input-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g., Finland"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Helsinki"
                    />
                  </div>
                  <div className="button-group">
                    <button onClick={handleSaveLocation}>Save Location</button>
                  </div>
                </div>

                {/* Forms for Room and Electric Heater */}
                <FormRoom
                  addRoom={addRoom}
                  homeAssistantSensors={homeAssistantSensors}
                />
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

        {/* Data Table Route */}
        <Route
          path="/data-table"
          element={
            <div>
              <DataTable
                rooms={rooms}
                homeAssistantSensors={homeAssistantSensors}
                fetchedDevices={fetchedDevices}
                deleteHeater={deleteHeater}
                deleteRoom={deleteRoom}
              />
            </div>
          }
        />

        {/* JSON Viewer Route */}
        <Route
          path="/json-viewer"
          element={<JsonViewer jsonContent={jsonContent} />}
        />

        {/* Electric Heaters Route */}
        <Route
          path="/electric-heaters"
          element={
            <DeviceCards
              rooms={rooms}
              activeDevices={activeDevices}
              toggleDeviceStatus={toggleDeviceStatus}
              apiKey={apiKey}
            />
          }
        />

        {/* Weather Forecast Route */}
        <Route
          path="/weather-forecast"
          element={<WeatherForecast place={savedLocation} updateOutsideTemp={updateOutsideTemp} />} // Pass 'place' and 'updateOutsideTemp' as props
        />
      </Routes>
    </Layout>
  );
}

export default App;
