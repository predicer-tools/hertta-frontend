// src/graphql/RoomNodesSection.jsx

import React, { useState, useContext } from 'react';
import { GRAPHQL_ENDPOINT, CREATE_NODE_MUTATION, SET_NODE_STATE_MUTATION } from '../graphql/queries';
import DataContext from '../context/DataContext';
import ConfigContext from '../context/ConfigContext';

const AIR_HEATING_CAPACITY = 0.00278; // kWh/(m²K)
const FLOOR_CONCRETE_HEATING_CAPACITY = 0.03; // kWh/(m²K) for floor concrete

const RoomNodesSection = () => {
  const [status, setStatus] = useState(null);
  const { rooms } = useContext(DataContext);
  const { config, materials } = useContext(ConfigContext);

  // Find the selected material value
  const selectedMat = materials.find(m => m.name === config.selectedMaterial);
  const materialHeatingCapacityPerArea = selectedMat ? selectedMat.value : 0.04; // default if not found

  // Helpers to create a node and set its state
  const createNode = async (node) => {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: CREATE_NODE_MUTATION,
        variables: { node },
      }),
    });
    const result = await response.json();
    return result.data.createNode;
  };

  const setNodeState = async (nodeName, state) => {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SET_NODE_STATE_MUTATION,
        variables: { nodeName, state },
      }),
    });
    const result = await response.json();
    return result.data.setNodeState;
  };

  const handleAddRoomNodes = async () => {
    setStatus('Processing...');

    try {
      // If no rooms, nothing to do
      if (rooms.length === 0) {
        setStatus('No rooms available to create nodes for.');
        return;
      }

      // We will track errors
      for (const room of rooms) {
        // Compute necessary values
        const roomArea = parseFloat(room.roomWidth) * parseFloat(room.roomLength);
        const t_e_conversion_total = materialHeatingCapacityPerArea * roomArea;
        const t_e_conversion_int = AIR_HEATING_CAPACITY * roomArea;
        const t_e_conversion_env = t_e_conversion_total - t_e_conversion_int;
        const t_e_conversion_floor_slab = FLOOR_CONCRETE_HEATING_CAPACITY * roomArea;

        // Convert sensorState to Kelvin
        let sensorStateKelvin = parseFloat(room.sensorState);
        if (isNaN(sensorStateKelvin)) {
          sensorStateKelvin = 0.0;
        }
        sensorStateKelvin += 273.15;

        const maxTempK = parseFloat(room.maxTemp) + 273.15;
        const minTempK = parseFloat(room.minTemp) + 273.15;

        // Define the nodes
        const airNode = {
          name: `${room.roomId}_air`,
          isCommodity: false,
          isMarket: false,
          isRes: false,
          cost: null,
          inflow: null,
        };

        const envelopeNode = {
          name: `${room.roomId}_envelope`,
          isCommodity: false,
          isMarket: false,
          isRes: false,
          cost: null,
          inflow: null,
        };

        const soilNode = {
          name: `${room.roomId}_soil`,
          isCommodity: false,
          isMarket: false,
          isRes: false,
          cost: null,
          inflow: null,
        };

        // Define states
        const airState = {
          inMax: 1e10,
          outMax: 1e10,
          stateLossProportional: 0.0,
          stateMin: minTempK,
          stateMax: maxTempK,
          initialState: sensorStateKelvin,
          isScenarioIndependent: false,
          isTemp: true,
          tEConversion: t_e_conversion_int,
          residualValue: 0.0,
        };

        const envelopeState = {
          inMax: 1e10,
          outMax: 1e10,
          stateLossProportional: 0.0,
          stateMin: 273.15,
          stateMax: 308.15,
          initialState: sensorStateKelvin,
          isScenarioIndependent: false,
          isTemp: true,
          tEConversion: t_e_conversion_env,
          residualValue: 0.0,
        };

        const soilState = {
          inMax: 1e10,
          outMax: 1e10,
          stateLossProportional: 0.0,
          stateMin: 273.15,
          stateMax: 308.15,
          initialState: 277.15, // default soil temperature in Kelvin
          isScenarioIndependent: false,
          isTemp: true,
          tEConversion: t_e_conversion_floor_slab,
          residualValue: 0.0,
        };

        // Create air node
        const airResult = await createNode(airNode);
        if (airResult.errors.length > 0) {
          const errorMessages = airResult.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
          setStatus(`Validation Errors (${room.roomId}_air): ${errorMessages}`);
          return;
        }

        // Create envelope node
        const envelopeResult = await createNode(envelopeNode);
        if (envelopeResult.errors.length > 0) {
          const errorMessages = envelopeResult.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
          setStatus(`Validation Errors (${room.roomId}_envelope): ${errorMessages}`);
          return;
        }

        // Create soil node
        const soilResult = await createNode(soilNode);
        if (soilResult.errors.length > 0) {
          const errorMessages = soilResult.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
          setStatus(`Validation Errors (${room.roomId}_soil): ${errorMessages}`);
          return;
        }

        // Set states
        const airStateResult = await setNodeState(airNode.name, airState);
        if (airStateResult.errors.length > 0) {
          const errorMessages = airStateResult.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
          setStatus(`State Errors (${room.roomId}_air): ${errorMessages}`);
          return;
        }

        const envelopeStateResult = await setNodeState(envelopeNode.name, envelopeState);
        if (envelopeStateResult.errors.length > 0) {
          const errorMessages = envelopeStateResult.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
          setStatus(`State Errors (${room.roomId}_envelope): ${errorMessages}`);
          return;
        }

        const soilStateResult = await setNodeState(soilNode.name, soilState);
        if (soilStateResult.errors.length > 0) {
          const errorMessages = soilStateResult.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
          setStatus(`State Errors (${room.roomId}_soil): ${errorMessages}`);
          return;
        }
      }

      setStatus('All room nodes created and states set successfully.');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section style={styles.section}>
      <h2>Create Room Nodes and Set States</h2>
      <p>This will create room nodes (_air, _envelope, _soil) for each room and set their states.</p>
      <button onClick={handleAddRoomNodes} style={styles.button}>
        Add Room Nodes & States
      </button>
      {status && <p>{status}</p>}
    </section>
  );
};

const styles = {
  section: {
    marginBottom: '40px',
    border: '1px solid #ccc',
    padding: '20px',
    borderRadius: '8px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#FFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    marginRight: '10px'
  },
};

export default RoomNodesSection;
