// App.js

import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './global.css';
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
import RoomPropertiesPopup from './RoomPropertiesPopup'; // Import the popup component

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

  // State for the popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Generate the JSON content whenever relevant states change
  useEffect(() => {
    const sensorStates = rooms.reduce((acc, room) => {
      acc[room.sensorId] = room.sensorState || 273.15;
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
    }
  }, [electricHeaters]);

  // Handle updates for sensor state changes
  const handleSensorUpdate = (sensorId, newState) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.sensorId === sensorId) {
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
        if (nodeKey.startsWith(sensorId)) {
          updatedNodes[nodeKey].state.initial_state = parseFloat(newState.state);
        }
      });

      return { ...prevData, nodes: updatedNodes };
    });
  };

  // Establish WebSocket connection on apiKey change
  useEffect(() => {
    if (apiKey) {
      connectWebSocket(apiKey, handleSensorUpdate);
    }
  }, [apiKey]);

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
      sensorUnit: selectedSensorData ? selectedSensorData.attributes.unit_of_measurement : '',
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
  };

  const deleteRoom = (sensorId) => {
    const updatedRooms = rooms.filter((room) => room.sensorId !== sensorId);
    setRooms(updatedRooms);
  };

  const deleteHeater = (id) => {
    const updatedHeaters = electricHeaters.filter((heater) => heater.id !== id);
    setElectricHeaters(updatedHeaters);
  };

  const toggleDeviceStatus = (id) => {
    setActiveDevices((prevStatus) => ({
      ...prevStatus,
      [id]: !prevStatus[id],
    }));
  };

  // Function to handle when a room is clicked in the visualization
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsPopupOpen(true);
  };

  // Function to handle saving the updated room data
  const handleSaveRoom = (updatedRoom) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.sensorId === updatedRoom.sensorId ? updatedRoom : room
      )
    );
  };

  return (
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
        <button onClick={fetchAllDevicesAndSensors}>Fetch Sensors and Devices</button>
        {error && (
          <p style={{ color: 'red' }}>
            <strong>Error:</strong> {error}
          </p>
        )}
      </div>

      <Routes>
        <Route
          path="/"
          element={
            <div className="app-container">
              <div className="left-side">
                <h1>Device Data Entry</h1>
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
          path="/processes-graph"
          element={
            <div className="graph-container">
              <h1>Processes Graph</h1>
              <HomeEnergyFlowVisualization
                processes={processes} // Ensure processes are passed
                rooms={rooms}
                onRoomClick={handleRoomClick} // Pass the handler
              />
              {/* Include the popup component */}
              <RoomPropertiesPopup
                roomData={selectedRoom}
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                onSave={handleSaveRoom}
              />
            </div>
          }
        />
        {/* Pass the generated jsonContent to JsonViewer */}
        <Route path="/json-viewer" element={<JsonViewer jsonContent={jsonContent} />} />
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
