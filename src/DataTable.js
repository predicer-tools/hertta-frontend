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

function App() {
  const [jsonContent, setJsonContent] = useState({});
  const [rooms, setRooms] = useState([]);
  const [apiKey, setApiKey] = useState('');
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

  // State to store the disconnect function for WebSocket
  const [webSocketDisconnect, setWebSocketDisconnect] = useState(null);

  // New States for Weather Data
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Function to fetch weather data from Python server
  const fetchWeatherData = async (startTime, endTime, place) => {
    const baseUrl = 'http://localhost:8001/get_weather_data';
    const params = new URLSearchParams({ start_time: startTime, end_time: endTime, place });

    setWeatherLoading(true);
    setWeatherError(null);
    setWeatherData(null);

    try {
      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setWeatherError(err.message || 'Failed to fetch weather data.');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Example: Fetch weather data on component mount (optional)
  // useEffect(() => {
  //   // Define default parameters
  //   const defaultStartTime = '2023-10-01T00:00:00Z';
  //   const defaultEndTime = '2023-10-02T00:00:00Z';
  //   const defaultPlace = 'Helsinki';
  //   fetchWeatherData(defaultStartTime, defaultEndTime, defaultPlace);
  // }, []);

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
      const response = await fetch('/api/states', { // Relative path uses proxy
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
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

    // Update activeDevices and userHeatingDevices if needed
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

  // Function to handle weather data submission
  const handleWeatherSubmit = (startTime, endTime, place) => {
    fetchWeatherData(startTime, endTime, place);
  };

  return (
    <Layout>
      <Routes>
        {/* Visualization as Home Page */}
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
                    <button onClick={fetchAllDevicesAndSensors}>
                      Fetch Sensors and Devices
                    </button>
                  </div>
                  {error && (
                    <p className="error-message">
                      <strong>Error:</strong> {error}
                    </p>
                  )}
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
          path="/device-cards"
          element={
            <div>
              <DataTable
                rooms={rooms}
                homeAssistantSensors={homeAssistantSensors}
                fetchedDevices={fetchedDevices}
                deleteHeater={deleteHeater}
                deleteRoom={deleteRoom}
                weatherData={weatherData} // Pass weatherData as a prop
                weatherLoading={weatherLoading}
                weatherError={weatherError}
                onWeatherSubmit={handleWeatherSubmit} // Pass function to handle weather data submission
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
