// src/graphql/GraphQLActions.jsx

import React from 'react';
import { useMutation } from '@apollo/client';
import {
  UPDATE_INPUT_DATA_SETUP_MUTATION,
  CREATE_PROCESS_MUTATION,
  CREATE_NODE_MUTATION,
  CREATE_SCENARIO_MUTATION,
  SET_NODE_STATE_MUTATION,
  CREATE_PROCESS_GROUP_MUTATION,
  CREATE_TOPOLOGY_MUTATION, // Import the new mutation
  CREATE_NODE_GROUP_MUTATION,
  CREATE_NODE_DELAY_MUTATION,
} from './queries';

const GraphQLActions = () => {
  // Define the setupUpdate object
  const setupUpdate = {
    containsReserves: true,
    containsOnline: false,
    containsStates: false,
    containsPiecewiseEff: false,
    containsRisk: false,
    containsDiffusion: false,
    containsDelay: false,
    containsMarkets: false,
    reserveRealization: true,
    useMarketBids: true,
    commonTimesteps: 0,
    commonScenarioName: 'ALL',
    useNodeDummyVariables: true,
    useRampDummyVariables: true,
    nodeDummyVariableCost: 100000.0,
    rampDummyVariableCost: 100000.0,
  };

  // Define the new process object
  const newProcess = {
    name: 'Process Alpha',
    conversion: 'UNIT', // Ensure this matches the enum in your schema
    isCfFix: false,
    isOnline: true,
    isRes: false,
    eff: 0.85,
    loadMin: 0.0,
    loadMax: 1.0,
    startCost: 5000.0,
    minOnline: 5.0,
    maxOnline: 120.0,
    minOffline: 2.0,
    maxOffline: 50.0,
    initialState: true,
    isScenarioIndependent: false,
    cf: 1.2,
    effTs: 0.75,
  };

  // Define the new node object
  const newNode = {
    name: 'Node Alpha',
    isCommodity: false,
    isMarket: true,
    isRes: false,
    cost: 50000.0,
    inflow: 100.0,
  };

  // Define the new scenario object
  const newScenario = {
    name: 'Scenario Alpha',
    weight: 1.0,
  };

  // Define the new node state object
  const newNodeState = {
    inMax: 50.0,
    outMax: 30.0,
    stateLossProportional: 0.05,
    stateMin: 10.0,
    stateMax: 100.0,
    initialState: 20.0,
    isScenarioIndependent: false,
    isTemp: false,
    tEConversion: 1.0,
    residualValue: 5000.0,
  };

  // Define the new process group object
  const newProcessGroup = {
    name: 'p1', // Set the process group name to "p1" as requested
  };

// Define the new node group object (you can customize the name):
const newNodeGroup = {
    name: 'NodeGroup Alpha',
};

  // Define the new topology object
  const newTopology = {
    capacity: 100.0,
    vomCost: 200.0,
    rampUp: 1.0,
    rampDown: 1.0,
    initialLoad: 50.0,
    initialFlow: 20.0,
    capTs: 1.0,
  };

  const newNodeDelay = {
    fromNode: 'NodeAlpha',  // Name of an existing node in your DB
    toNode: 'NodeBeta',     // Name of another existing node in your DB
    delay: 3.0,            // Example: 3.0 time units of delay
    minDelayFlow: 1.0,     // Minimum possible flow during the delay
    maxDelayFlow: 5.0,     // Maximum possible flow during the delay
  };

  // useMutation hook for updating input data setup
  const [updateInputDataSetup, { data: updateData, loading: updateLoading, error: updateError }] = useMutation(
    UPDATE_INPUT_DATA_SETUP_MUTATION,
    {
      variables: { setupUpdate },
      onCompleted: (response) => {
        if (response.updateInputDataSetup.errors.length === 0) {
          alert('Input Data Setup updated successfully!');
          // Optionally, trigger a refetch or update cache here
        } else {
          // Handle validation errors
          const errorMessages = response.updateInputDataSetup.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join('\n');
          alert(`Errors:\n${errorMessages}`);
        }
      },
      onError: (mutationError) => {
        // Handle unexpected errors (e.g., network issues)
        console.error('Update Mutation Error:', mutationError);
        alert('An unexpected error occurred while updating Input Data Setup.');
      },
    }
  );

  // useMutation hook for creating a new process
  const [createProcess, { data: createData, loading: createLoading, error: createError }] = useMutation(
    CREATE_PROCESS_MUTATION,
    {
      variables: { process: newProcess },
      onCompleted: (response) => {
        if (response.createProcess.errors.length === 0) {
          alert('Process created successfully!');
          // Optionally, trigger a refetch or update cache here
        } else {
          // Handle validation errors
          const errorMessages = response.createProcess.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join('\n');
          alert(`Errors:\n${errorMessages}`);
        }
      },
      onError: (mutationError) => {
        // Handle unexpected errors (e.g., network issues)
        console.error('Create Process Mutation Error:', mutationError);
        alert('An unexpected error occurred while creating the process.');
      },
    }
  );

  // useMutation hook for creating a new node
  const [createNode, { data: createNodeData, loading: createNodeLoading, error: createNodeError }] = useMutation(
    CREATE_NODE_MUTATION,
    {
      variables: { node: newNode },
      onCompleted: (response) => {
        if (response.createNode.errors.length === 0) {
          alert('Node created successfully!');
          // Optionally, trigger a refetch or update cache here
        } else {
          // Handle validation errors
          const errorMessages = response.createNode.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join('\n');
          alert(`Errors:\n${errorMessages}`);
        }
      },
      onError: (mutationError) => {
        // Handle unexpected errors (e.g., network issues)
        console.error('Create Node Mutation Error:', mutationError);
        alert('An unexpected error occurred while creating the node.');
      },
    }
  );

  // useMutation hook for creating a new scenario
  const [createScenario, { data: createScenarioData, loading: createScenarioLoading, error: createScenarioError }] = useMutation(
    CREATE_SCENARIO_MUTATION,
    {
      variables: { name: newScenario.name, weight: newScenario.weight },
      onCompleted: (response) => {
        if (!response.createScenario.message) {
          alert('Scenario created successfully!');
          // Optionally, trigger a refetch or update cache here
        } else {
          // Handle validation errors or other messages
          alert(`Error: ${response.createScenario.message}`);
        }
      },
      onError: (mutationError) => {
        // Handle unexpected errors (e.g., network issues)
        console.error('Create Scenario Mutation Error:', mutationError);
        alert('An unexpected error occurred while creating the scenario.');
      },
    }
  );

  // useMutation hook for setting node state
  const [setNodeState, { data: setNodeStateData, loading: setNodeStateLoading, error: setNodeStateError }] = useMutation(
    SET_NODE_STATE_MUTATION,
    {
      variables: { state: newNodeState, nodeName: 'Node Alpha' }, // Replace 'Node Alpha' with the target node name if needed
      onCompleted: (response) => {
        if (response.setNodeState.errors.length === 0) {
          alert('Node state updated successfully!');
          // Optionally, trigger a refetch or update cache here
        } else {
          // Handle validation errors
          const errorMessages = response.setNodeState.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join('\n');
          alert(`Errors:\n${errorMessages}`);
        }
      },
      onError: (mutationError) => {
        // Handle unexpected errors (e.g., network issues)
        console.error('Set Node State Mutation Error:', mutationError);
        alert('An unexpected error occurred while setting the node state.');
      },
    }
  );

  // useMutation hook for creating a new process group
  const [createProcessGroup, { data: createProcessGroupData, loading: createProcessGroupLoading, error: createProcessGroupError }] = useMutation(
    CREATE_PROCESS_GROUP_MUTATION,
    {
      variables: { name: newProcessGroup.name }, // Name is set to "p1"
      onCompleted: (response) => {
        if (!response.createProcessGroup.message) {
          alert('Process group "p1" created successfully!');
          // Optionally, trigger a refetch or update cache here
        } else {
          // Handle validation errors or other messages
          alert(`Error: ${response.createProcessGroup.message}`);
        }
      },
      onError: (mutationError) => {
        // Handle unexpected errors (e.g., network issues)
        console.error('Create Process Group Mutation Error:', mutationError);
        alert('An unexpected error occurred while creating the process group.');
      },
    }
  );

    // Use the mutation hook for creating a new node group
    const [createNodeGroup, { data: createNodeGroupData, loading: createNodeGroupLoading, error: createNodeGroupError }] =
    useMutation(CREATE_NODE_GROUP_MUTATION, {
      variables: { name: newNodeGroup.name },
      onCompleted: (response) => {
        if (!response.createNodeGroup.message) {
          alert(`Node group "${newNodeGroup.name}" created successfully!`);
          // Optionally, trigger a refetch or update cache here
        } else {
          // Handle validation errors or other messages
          alert(`Error: ${response.createNodeGroup.message}`);
        }
      },
      onError: (mutationError) => {
        // Handle unexpected errors (e.g., network issues)
        console.error('Create Node Group Mutation Error:', mutationError);
        alert('An unexpected error occurred while creating the node group.');
      },
    });

  // useMutation hook for creating a new topology
  const [createTopology, { data: createTopologyData, loading: createTopologyLoading, error: createTopologyError }] = useMutation(
    CREATE_TOPOLOGY_MUTATION,
    {
      variables: {
        topology: newTopology,
        sourceNodeName: 'Node Alpha', // Replace with actual source node name
        processName: 'Process Alpha', // Ensure this process exists
        sinkNodeName: 'Node Alpha', // Replace with actual sink node name or leave as needed
      },
      onCompleted: (response) => {
        if (response.createTopology.errors.length === 0) {
          alert('Topology "p1" created successfully!');
          // Optionally, trigger a refetch or update cache here
        } else {
          // Handle validation errors
          const errorMessages = response.createTopology.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join('\n');
          alert(`Errors:\n${errorMessages}`);
        }
      },
      onError: (mutationError) => {
        // Handle unexpected errors (e.g., network issues)
        console.error('Create Topology Mutation Error:', mutationError);
        alert('An unexpected error occurred while creating the topology.');
      },
    }
  );

    // Mutation hook for creating a new node delay
    const [
        createNodeDelay, 
        { data: createNodeDelayData, loading: createNodeDelayLoading, error: createNodeDelayError }
      ] = useMutation(CREATE_NODE_DELAY_MUTATION, {
        variables: { delay: newNodeDelay },
        onCompleted: (response) => {
          if (response.createNodeDelay.errors.length === 0) {
            alert('Node Delay created successfully!');
          } else {
            // If there were validation errors, list them
            const errorMessages = response.createNodeDelay.errors
              .map((err) => `${err.field}: ${err.message}`)
              .join('\n');
            alert(`Validation Errors:\n${errorMessages}`);
          }
        },
        onError: (mutationError) => {
          // Handle unexpected or network errors
          console.error('Create Node Delay Mutation Error:', mutationError);
          alert('An unexpected error occurred while creating the Node Delay.');
        },
      });

  // Handler for updating input data setup
  const handleUpdateInputDataSetup = () => {
    updateInputDataSetup();
  };

  // Handler for creating a new process
  const handleCreateProcess = () => {
    createProcess();
  };

  // Handler for creating a new node
  const handleCreateNode = () => {
    createNode();
  };

  // Handler for creating a new scenario
  const handleCreateScenario = () => {
    createScenario();
  };

  // Handler for setting node state
  const handleSetNodeState = () => {
    setNodeState();
  };

  // Handler for creating a new process group
  const handleCreateProcessGroup = () => {
    createProcessGroup();
  };

// Handler for creating a new node group
const handleCreateNodeGroup = () => {
    createNodeGroup();
};

  // Handler for creating a new topology
  const handleCreateTopology = () => {
    createTopology();
  };

    // Handler for creating a Node Delay
    const handleCreateNodeDelay = () => {
        createNodeDelay();
    };

  return (
    <div style={styles.container}>
      <h2>GraphQL Actions</h2>

      {/* Update Input Data Setup Section */}
      <div style={styles.actionSection}>
        <h3>Update Input Data Setup</h3>
        <button onClick={handleUpdateInputDataSetup} disabled={updateLoading} style={styles.button}>
          {updateLoading ? 'Updating...' : 'Update Input Data Setup'}
        </button>
        {updateError && <p style={styles.error}>Error: {updateError.message}</p>}
        {updateData && updateData.updateInputDataSetup.errors.length === 0 && (
          <p style={styles.success}>Input Data Setup updated successfully!</p>
        )}
      </div>

      {/* Create New Process Section */}
      <div style={styles.actionSection}>
        <h3>Create New Process</h3>
        <button onClick={handleCreateProcess} disabled={createLoading} style={styles.button}>
          {createLoading ? 'Creating...' : 'Create New Process'}
        </button>
        {createError && <p style={styles.error}>Error: {createError.message}</p>}
        {createData && createData.createProcess.errors.length === 0 && (
          <p style={styles.success}>Process created successfully!</p>
        )}
      </div>

      {/* Create New Node Section */}
      <div style={styles.actionSection}>
        <h3>Create New Node</h3>
        <button onClick={handleCreateNode} disabled={createNodeLoading} style={styles.button}>
          {createNodeLoading ? 'Creating...' : 'Create New Node'}
        </button>
        {createNodeError && <p style={styles.error}>Error: {createNodeError.message}</p>}
        {createNodeData && createNodeData.createNode.errors.length === 0 && (
          <p style={styles.success}>Node created successfully!</p>
        )}
      </div>

      {/* Create New Scenario Section */}
      <div style={styles.actionSection}>
        <h3>Create New Scenario</h3>
        <button onClick={handleCreateScenario} disabled={createScenarioLoading} style={styles.button}>
          {createScenarioLoading ? 'Creating...' : 'Create New Scenario'}
        </button>
        {createScenarioError && <p style={styles.error}>Error: {createScenarioError.message}</p>}
        {createScenarioData && !createScenarioData.createScenario.message && (
          <p style={styles.success}>Scenario created successfully!</p>
        )}
        {createScenarioData && createScenarioData.createScenario.message && (
          <p style={styles.error}>Error: {createScenarioData.createScenario.message}</p>
        )}
      </div>

      {/* Set Node State Section */}
      <div style={styles.actionSection}>
        <h3>Set Node State</h3>
        <button onClick={handleSetNodeState} disabled={setNodeStateLoading} style={styles.button}>
          {setNodeStateLoading ? 'Setting...' : 'Set Node State'}
        </button>
        {setNodeStateError && <p style={styles.error}>Error: {setNodeStateError.message}</p>}
        {setNodeStateData && setNodeStateData.setNodeState.errors.length === 0 && (
          <p style={styles.success}>Node state updated successfully!</p>
        )}
      </div>

      {/* Create New Process Group Section */}
      <div style={styles.actionSection}>
        <h3>Create New Process Group</h3>
        <button onClick={handleCreateProcessGroup} disabled={createProcessGroupLoading} style={styles.button}>
          {createProcessGroupLoading ? 'Creating...' : 'Create Process Group "p1"'}
        </button>
        {createProcessGroupError && <p style={styles.error}>Error: {createProcessGroupError.message}</p>}
        {createProcessGroupData && !createProcessGroupData.createProcessGroup.message && (
          <p style={styles.success}>Process group "p1" created successfully!</p>
        )}
        {createProcessGroupData && createProcessGroupData.createProcessGroup.message && (
          <p style={styles.error}>Error: {createProcessGroupData.createProcessGroup.message}</p>
        )}
      </div>

    {/* Create New Node Group Section */}
    <div style={styles.actionSection}>
        <h3>Create New Node Group</h3>
        <button onClick={handleCreateNodeGroup} disabled={createNodeGroupLoading} style={styles.button}>
          {createNodeGroupLoading ? 'Creating...' : `Create Node Group "${newNodeGroup.name}"`}
        </button>
        {createNodeGroupError && <p style={styles.error}>Error: {createNodeGroupError.message}</p>}
        {createNodeGroupData && !createNodeGroupData.createNodeGroup.message && (
          <p style={styles.success}>Node group "{newNodeGroup.name}" created successfully!</p>
        )}
        {createNodeGroupData && createNodeGroupData.createNodeGroup.message && (
          <p style={styles.error}>Error: {createNodeGroupData.createNodeGroup.message}</p>
        )}
    </div>

      {/* Create New Topology Section */}
      <div style={styles.actionSection}>
        <h3>Create New Topology</h3>
        <button onClick={handleCreateTopology} disabled={createTopologyLoading} style={styles.button}>
          {createTopologyLoading ? 'Creating...' : 'Create New Topology'}
        </button>
        {createTopologyError && <p style={styles.error}>Error: {createTopologyError.message}</p>}
        {createTopologyData && createTopologyData.createTopology.errors.length === 0 && (
          <p style={styles.success}>Topology created successfully!</p>
        )}
        {createTopologyData && createTopologyData.createTopology.errors.length > 0 && (
          <div style={styles.error}>
            <h4>Validation Errors:</h4>
            <ul>
              {createTopologyData.createTopology.errors.map((err, index) => (
                <li key={index}>
                  {err.field}: {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Create New Node Delay Section */}
      <div style={styles.actionSection}>
        <h3>Create Node Delay</h3>
        <button
          onClick={handleCreateNodeDelay}
          disabled={createNodeDelayLoading}
          style={styles.button}
        >
          {createNodeDelayLoading ? 'Creating...' : 'Create Node Delay'}
        </button>

        {/* Network or unexpected error */}
        {createNodeDelayError && (
          <p style={styles.error}>Error: {createNodeDelayError.message}</p>
        )}

        {/* Successful creation */}
        {createNodeDelayData && createNodeDelayData.createNodeDelay.errors.length === 0 && (
          <p style={styles.success}>Node Delay created successfully!</p>
        )}

        {/* Validation errors from backend */}
        {createNodeDelayData && createNodeDelayData.createNodeDelay.errors.length > 0 && (
          <div style={styles.error}>
            <h4>Validation Errors:</h4>
            <ul>
              {createNodeDelayData.createNodeDelay.errors.map((err, index) => (
                <li key={index}>{`${err.field}: ${err.message}`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Basic styling
const styles = {
  container: {
    padding: '20px',
    border: '2px solid #f0f0f0',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  actionSection: {
    marginBottom: '30px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  success: {
    color: 'green',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default GraphQLActions;
