// src/graphql/NodeSection.jsx

import React, { useState } from 'react';
import { GRAPHQL_ENDPOINT, CREATE_NODE_MUTATION, SET_NODE_STATE_MUTATION } from '../graphql/queries';

const NodeSection = () => {
  const [nodeStatus, setNodeStatus] = useState(null);

  const electricitygrid = {
    name: "electricitygrid",
    isCommodity: false,
    isMarket: false,
    isRes: false,
    cost: null,
    inflow: null
  };

  const electricitygrid_state = {
    inMax: 0.0,
    outMax: 0.0,
    stateLossProportional: 0.0,
    stateMin: 0.0,
    stateMax: 0.0,
    initialState: 0.0,
    isScenarioIndependent: false,
    isTemp: false,
    tEConversion: 1.0,
    residualValue: 0.0
  };

  const outside = {
    name: "outside",
    isCommodity: false,
    isMarket: false,
    isRes: false,
    cost: null,
    inflow: null
  };

  const outside_state = {
    inMax: 1e10,
    outMax: 1e10,
    stateLossProportional: 0.0,
    stateMin: 238.15,
    stateMax: 308.15,
    initialState: 0.0,
    isScenarioIndependent: false,
    isTemp: true,
    tEConversion: 1e9,
    residualValue: 0.0
  };

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

  const handleCreateNodesAndStates = async () => {
    setNodeStatus('Processing...');

    try {
      // 1. Create electricitygrid node
      const gridResult = await createNode(electricitygrid);
      if (gridResult.errors.length > 0) {
        const errorMessages = gridResult.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
        setNodeStatus(`Validation Errors (electricitygrid): ${errorMessages}`);
        return;
      }

      // 2. Create outside node
      const outsideResult = await createNode(outside);
      if (outsideResult.errors.length > 0) {
        const errorMessages = outsideResult.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
        setNodeStatus(`Validation Errors (outside): ${errorMessages}`);
        return;
      }

      // 3. Set state for electricitygrid
      const gridStateResult = await setNodeState(electricitygrid.name, electricitygrid_state);
      if (gridStateResult.errors.length > 0) {
        const errorMessages = gridStateResult.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
        setNodeStatus(`State Errors (electricitygrid): ${errorMessages}`);
        return;
      }

      // 4. Set state for outside
      const outsideStateResult = await setNodeState(outside.name, outside_state);
      if (outsideStateResult.errors.length > 0) {
        const errorMessages = outsideStateResult.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
        setNodeStatus(`State Errors (outside): ${errorMessages}`);
        return;
      }

      setNodeStatus('Both nodes (electricitygrid, outside) created and states set successfully.');
    } catch (error) {
      setNodeStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section style={styles.section}>
      <h2>Create Predefined Nodes and Set States</h2>
      <p>This will create "electricitygrid" and "outside" nodes and set their states.</p>
      <button onClick={handleCreateNodesAndStates} style={styles.button}>
        Add Predefined Nodes & States
      </button>
      {nodeStatus && <p>{nodeStatus}</p>}
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

export default NodeSection;
