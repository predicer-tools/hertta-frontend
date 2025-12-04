// src/graphql/NodeSection.jsx

import React, { useState, useContext, useEffect, useCallback } from 'react';
import ConfigContext from '../context/ConfigContext';
import {
  GRAPHQL_ENDPOINT,
  CREATE_NODE_MUTATION,
  SET_NODE_STATE_MUTATION,
  CREATE_NODE_DIFFUSION_MUTATION, // Ensure this is imported
} from './queries'; // Corrected import path

const NodeSection = () => {
  const [nodeStatus, setNodeStatus] = useState(null);
  const { isConfigured } = useContext(ConfigContext);

  // Helper function to execute GraphQL mutations
  const executeMutation = async (mutation, variables) => {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });
    const result = await response.json();
    return result.data;
  };

  const handleCreateNodesAndStates = useCallback(async () => {
    // Define objects inside the useCallback to stabilize dependencies
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

    setNodeStatus('Processing...');

    try {
      // 1. Create electricitygrid node
      const gridResult = await executeMutation(CREATE_NODE_MUTATION, { node: electricitygrid });
      if (gridResult.createNode.errors && gridResult.createNode.errors.length > 0) {
        const errorMessages = gridResult.createNode.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
        setNodeStatus(`Validation Errors (electricitygrid): ${errorMessages}`);
        return;
      }

      // 2. Create outside node
      const outsideResult = await executeMutation(CREATE_NODE_MUTATION, { node: outside });
      if (outsideResult.createNode.errors && outsideResult.createNode.errors.length > 0) {
        const errorMessages = outsideResult.createNode.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
        setNodeStatus(`Validation Errors (outside): ${errorMessages}`);
        return;
      }

      // 3. Set state for electricitygrid
      const gridStateResult = await executeMutation(SET_NODE_STATE_MUTATION, { nodeName: electricitygrid.name, state: electricitygrid_state });
      if (gridStateResult.setNodeState.errors && gridStateResult.setNodeState.errors.length > 0) {
        const errorMessages = gridStateResult.setNodeState.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
        setNodeStatus(`State Errors (electricitygrid): ${errorMessages}`);
        return;
      }

      // 4. Set state for outside
      const outsideStateResult = await executeMutation(SET_NODE_STATE_MUTATION, { nodeName: outside.name, state: outside_state });
      if (outsideStateResult.setNodeState.errors && outsideStateResult.setNodeState.errors.length > 0) {
        const errorMessages = outsideStateResult.setNodeState.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
        setNodeStatus(`State Errors (outside): ${errorMessages}`);
        return;
      }

      // 5. Create diffusion from outside to electricitygrid
      const diffusionResult = await executeMutation(CREATE_NODE_DIFFUSION_MUTATION, {
        fromNode: outside.name,
        toNode: electricitygrid.name,
        coefficient: 1.0 // Adjust as needed
      });

      if (diffusionResult.createNodeDiffusion.errors && diffusionResult.createNodeDiffusion.errors.length > 0) {
        const errorMessages = diffusionResult.createNodeDiffusion.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
        setNodeStatus(`Diffusion Errors: ${errorMessages}`);
        return;
      }

      setNodeStatus('Both nodes (electricitygrid, outside) created and states set successfully.');
    } catch (error) {
      setNodeStatus(`Error: ${error.message}`);
    }
  }, []); // Empty dependency array since all variables are defined inside

  // Event listener for manual node creation trigger
  useEffect(() => {
    const handleRunNodeCreation = () => {
      handleCreateNodesAndStates();
    };

    window.addEventListener('runNodeCreation', handleRunNodeCreation);

    return () => {
      window.removeEventListener('runNodeCreation', handleRunNodeCreation);
    };
  }, [handleCreateNodesAndStates]);

  // Automatically create nodes when configured
  useEffect(() => {
    if (isConfigured) {
      handleCreateNodesAndStates();
    }
  }, [isConfigured, handleCreateNodesAndStates]);

  return (
    <section style={styles.section}>
      <h2>Create Predefined Nodes and Set States</h2>
      <p>This section automatically sets up "electricitygrid" and "outside" nodes once the configuration is completed.</p>
      {nodeStatus && <p>{nodeStatus}</p>}
      <button
        onClick={handleCreateNodesAndStates}
        style={styles.button}
        disabled={nodeStatus === 'Processing...'}
      >
        {nodeStatus === 'Processing...' ? 'Processing...' : 'Create Nodes and Set States'}
      </button>
    </section>
  );
};

const styles = {
  section: {
    marginBottom: '40px',
    border: '1px solid #ccc',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#d1ecf1',
  },
  button: {
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default NodeSection;
