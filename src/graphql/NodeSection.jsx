// src/components/NodeSection.jsx

import React, { useState } from 'react';
import { GRAPHQL_ENDPOINT, CREATE_NODE_MUTATION, SET_NODE_STATE_MUTATION } from '../graphql/queries';

const NodeSection = () => {
  const [nodeStatus, setNodeStatus] = useState(null);
  const [stateStatus, setStateStatus] = useState(null);

  const electricitygrid = {
    name: "electricitygrid",
    isCommodity: false,
    isMarket: false,
    isRes: false,
    cost: null,
    inflow: null
  };

  const predefinedState = {
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

  const handleCreateNode = async () => {
    setNodeStatus('Processing...');
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: CREATE_NODE_MUTATION,
          variables: { node: electricitygrid },
        }),
      });

      const result = await response.json();
      if (result.data.createNode.errors.length > 0) {
        const errorMessages = result.data.createNode.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join(', ');
        setNodeStatus(`Validation Errors: ${errorMessages}`);
      } else {
        setNodeStatus('Node created successfully.');
      }
    } catch (error) {
      setNodeStatus(`Error: ${error.message}`);
    }
  };

  const handleSetNodeState = async () => {
    setStateStatus('Processing...');
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: SET_NODE_STATE_MUTATION,
          variables: { nodeName: electricitygrid.name, state: predefinedState },
        }),
      });

      const result = await response.json();
      if (result.data.setNodeState.errors.length > 0) {
        const errorMessages = result.data.setNodeState.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join(', ');
        setStateStatus(`Validation Errors: ${errorMessages}`);
      } else {
        setStateStatus('State set successfully.');
      }
    } catch (error) {
      setStateStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section style={styles.section}>
      <h2>Create Predefined Node</h2>
      <button onClick={handleCreateNode} style={styles.button}>
        Add Predefined Node
      </button>
      {nodeStatus && <p>{nodeStatus}</p>}

      <h2>Set Predefined State to the Node</h2>
      <p>This will set a predefined state to the node "Node1".</p>
      <button onClick={handleSetNodeState} style={styles.button}>
        Set Predefined State
      </button>
      {stateStatus && <p>{stateStatus}</p>}
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
