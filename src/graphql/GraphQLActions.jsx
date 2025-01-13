// src/graphql/GraphQLActions.jsx

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Modal from '../components/Modal/Modal';
import InputSetupModal from '../components/Modal/InputSetupModal';
import ProcessModal from '../components/Modal/ProcessModal';
import NodeModal from '../components/Modal/NodeModal';
import MarketModal from '../components/Modal/MarketModal';
import StateModal from '../components/Modal/StateModal';
import AddScenarioModal from '../components/Modal/AddScenarioModal';
import TopologyModal from '../components/Modal/TopologyModal';
import NodeDelayModal from '../components/Modal/NodeDelayModal';

import {
  UPDATE_INPUT_DATA_SETUP_MUTATION,
  CREATE_PROCESS_MUTATION,
  CREATE_NODE_MUTATION,
  CREATE_SCENARIO_MUTATION,
  SET_NODE_STATE_MUTATION,
  CREATE_PROCESS_GROUP_MUTATION,
  CREATE_TOPOLOGY_MUTATION,
  CREATE_NODE_GROUP_MUTATION,
  CREATE_NODE_DELAY_MUTATION,
  CREATE_NODE_HISTORY_MUTATION,
  CREATE_MARKET_MUTATION,
  CREATE_NODE_DIFFUSION_MUTATION,
  CREATE_RISK_MUTATION,
  CREATE_GEN_CONSTRAINT_MUTATION,
  CREATE_FLOW_CON_FACTOR_MUTATION,
  CREATE_STATE_CON_FACTOR_MUTATION,
  CREATE_ONLINE_CON_FACTOR_MUTATION,
  ADD_PROCESS_TO_GROUP_MUTATION,
  ADD_NODE_TO_GROUP_MUTATION,
  START_ELECTRICITY_PRICE_FETCH_MUTATION,
  START_WEATHER_FORECAST_FETCH_MUTATION,
  UPDATE_NODE_STATE_MUTATION,
  CONNECT_NODE_INFLOW_TO_TEMPERATURE_FORECAST_MUTATION,
  CONNECT_MARKET_PRICES_TO_FORECAST_MUTATION,
  CLEAR_INPUT_DATA_MUTATION,
  SAVE_MODEL_MUTATION,
  START_OPTIMIZATION_MUTATION,
  JOB_STATUS_QUERY,
  GET_NODE_NAMES,
  GET_SCENARIOS,
  

} from './queries';

const GraphQLActions = () => {
  // Define the setupUpdate object

  const [isInputSetupModalOpen, setIsInputSetupModalOpen] = useState(false);
  const openInputSetupModal = () => setIsInputSetupModalOpen(true);
  const closeInputSetupModal = () => setIsInputSetupModalOpen(false);

  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const openProcessModal = () => setIsProcessModalOpen(true);
  const closeProcessModal = () => setIsProcessModalOpen(false);

  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const openNodeModal = () => setIsNodeModalOpen(true);
  const closeNodeModal = () => setIsNodeModalOpen(false);

  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
const openMarketModal = () => setIsMarketModalOpen(true);
const closeMarketModal = () => setIsMarketModalOpen(false);

const [isStateModalOpen, setIsStateModalOpen] = useState(false);
const openStateModal = () => setIsStateModalOpen(true);
const closeStateModal = () => setIsStateModalOpen(false);

  // State to manage the visibility of the AddScenarioModal
  const [isAddScenarioModalOpen, setIsAddScenarioModalOpen] = useState(false);
  const openAddScenarioModal = () => setIsAddScenarioModalOpen(true);
  const closeAddScenarioModal = () => setIsAddScenarioModalOpen(false);

  const [isTopologyModalOpen, setIsTopologyModalOpen] = useState(false);
  const openTopologyModal = () => setIsTopologyModalOpen(true);
  const closeTopologyModal = () => setIsTopologyModalOpen(false);

  const [isNodeDelayModalOpen, setIsNodeDelayModalOpen] = useState(false);
  const openNodeDelayModal = () => setIsNodeDelayModalOpen(true);
  const closeNodeDelayModal = () => setIsNodeDelayModalOpen(false);


  // 2) State mirroring your setupUpdate object
  const [inputSetupForm, setInputSetupForm] = useState({
    containsReserves: true,
    containsOnline: false,
    containsStates: false,
    containsPiecewiseEff: false,
    containsRisk: false,
    containsDiffusion: true,
    containsDelay: false,
    containsMarkets: true,
    reserveRealization: true,
    useMarketBids: true,
    commonTimesteps: 0,
    commonScenarioName: 'ALL',
    useNodeDummyVariables: true,
    useRampDummyVariables: true,
    nodeDummyVariableCost: 100000.0,
    rampDummyVariableCost: 100000.0,
  });

  const [nodeForm, setNodeForm] = useState({
    name: '',
    isCommodity: false,
    isMarket: true,
    isRes: false,
    cost: 0.0,
    inflow: 0.0,
  });

  const [processForm, setProcessForm] = useState({
    name: '',
    conversion: 'UNIT', // Default enum value
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
  });

  // Market form state
const [marketForm, setMarketForm] = useState({
    name: '',
    mType: 'ENERGY',   // default
    node: 'NodeAlpha', // for example
    processGroup: 'p1',
    direction: 'UP_DOWN',
    realisation: 1.2,
    reserveType: '',
    isBid: true,
    isLimited: false,
    minBid: 10.0,
    maxBid: 100.0,
    fee: 5.0,
    price: 30.0,
    upPrice: 35.0,
    downPrice: 25.0,
    reserveActivationPrice: 45.0,
  });

  const [stateForm, setStateForm] = useState({
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
  });

  const handleInputSetupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputSetupForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProcessFormChange = (e) => {
    const { name, type, checked, value } = e.target;
    setProcessForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNodeFormChange = (e) => {
    const { name, type, checked, value } = e.target;
    setNodeForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMarketFormChange = (e) => {
    const { name, type, checked, value } = e.target;
    setMarketForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleStateFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStateForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value),
    }));
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

  const targetNodeName = newNode.name;

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

  // Example Market Data (adjust these values to your needs)
  const newMarket = {
    name: 'npe',
    mType: 'ENERGY',       // Must match MarketType enum: ENERGY or RESERVE
    node: 'NodeAlpha',     // This node must already exist in your system
    processGroup: 'p1',    // This process group must already exist in your system
    direction: 'UP_DOWN',  // MarketDirection enum: UP, DOWN, UP_DOWN
    realisation: 1.2,      // Example float
    reserveType: '',       // Provide a valid reserve type if needed, else an empty string
    isBid: true,
    isLimited: false,
    minBid: 10.0,
    maxBid: 100.0,
    fee: 5.0,
    price: 30.0,
    upPrice: 35.0,
    downPrice: 25.0,
    reserveActivationPrice: 45.0,
  };

  const [newProcessGroup, setNewProcessGroup] = useState({ name: '' });
  const [newNodeGroup, setNewNodeGroup] = useState({ name: '' });

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

  const nodeNameForHistory = '';

  const newDiffusion = {
    fromNode: 'NodeAlpha',
    toNode: 'NodeBeta',
    coefficient: 0.05, // Example diffusion coefficient
  };

  const newRisk = {
    parameter: 'PriceVolatility', // Example parameter name
    value: 0.15,                  // Example float value for risk
  };

  const newGenConstraint = {
    name: 'ConstraintAlpha',
    gcType: 'LESS_THAN',   // Must be one of: LESS_THAN, EQUAL, GREATER_THAN
    isSetpoint: false,
    penalty: 1000.0,
    constant: 50.0,
  };

  const newFlowConFactor = {
    factor: 1.25,                // The factor value
    constraintName: 'ConstraintAlpha',    // Must be an existing generic constraint's name
    processName: 'Process Alpha', // Must be an existing process's name
    sourceOrSinkNodeName: 'Node Alpha',   // The node name used as a source or sink in that process
  };

  const newStateConFactor = {
    factor: 2.5,                 // The factor value
    constraintName: 'ConstraintAlpha', // Must match an existing constraint
    nodeName: 'NodeAlpha',       // Must be a valid node name
  };

  const newOnlineConFactor = {
    factor: 3.0,                // Example factor value
    constraintName: 'ConstraintAlpha', // Must be an existing constraint name
    processName: 'Process Alpha',      // Must be a valid process name
  };

  const updatedNodeState = {
    inMax: 75.0,        // e.g., new max inflow
    outMax: 60.0,       // e.g., new max outflow
    stateLossProportional: 0.02, // updated state loss
    stateMax: 200.0,    // new maximum state
    stateMin: 20.0,     // new minimum state
    initialState: 40.0, // new initial state
    isScenarioIndependent: true,
    isTemp: false,
    tEConversion: 1.1,
    residualValue: 999.0,
  };

  const temperatureForecastName = 'TemperatureForecastAlpha';
  const marketForecastName = 'MyMarketForecast';
  const marketName = newMarket.name;

  const { data: nodeData, loading: nodeLoading, error: nodeError } = useQuery(GET_NODE_NAMES);
  const nodes = nodeData?.model?.inputData?.nodes || [];
  const { data: scenarioData, loading: scenarioLoading, error: scenarioError } = useQuery(GET_SCENARIOS);
  const scenarios = scenarioData?.model?.inputData?.scenarios || [];

  // useMutation hook for updating input data setup
  const [updateInputDataSetup, { data: updateData, loading: updateLoading, error: updateError }] =
  useMutation(UPDATE_INPUT_DATA_SETUP_MUTATION, {
    onCompleted: (response) => {
      if (response.updateInputDataSetup.errors.length === 0) {
        alert('Input Data Setup updated successfully!');
      } else {
        // handle validation errors
      }
    },
    onError: (mutationError) => {
      // handle unexpected errors
    },
  });

  const handleSubmitInputSetup = (e) => {
    e.preventDefault();
    // Trigger the mutation with updated values
    updateInputDataSetup({
      variables: { setupUpdate: { ...inputSetupForm } },
    });
  };

  // useMutation hook for creating a new process
  const [createProcess, { data: createData, loading: createLoading, error: createError }] = useMutation(
    CREATE_PROCESS_MUTATION,
    {
      onCompleted: (response) => {
        if (response.createProcess.errors.length === 0) {
          alert('Process created successfully!');
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

  const handleProcessFormSubmit = (e) => {
    e.preventDefault();
    createProcess({ variables: { process: processForm } });
    // Optionally close the modal after creating
    closeProcessModal();
  };

  const [createNode, {
    data: createNodeData,
    loading: createNodeLoading,
    error: createNodeError,
  }] = useMutation(CREATE_NODE_MUTATION, {
    onCompleted: (response) => {
      if (response.createNode.errors.length === 0) {
        alert('Node created successfully!');
        // Optionally refetch or do more logic here
      } else {
        // Handle validation errors
        const errorMessages = response.createNode.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('\n');
        alert(`Errors:\n${errorMessages}`);
      }
    },
    onError: (mutationError) => {
      console.error('Create Node Mutation Error:', mutationError);
      alert('An unexpected error occurred while creating the node.');
    },
  });

  const handleNodeFormSubmit = (e) => {
    e.preventDefault();
    // Pass user-defined node fields to mutation
    createNode({ variables: { node: nodeForm } });
    // Close modal after submission
    closeNodeModal();
  };

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

  const [createProcessGroup, { data: createProcessGroupData, loading: createProcessGroupLoading, error: createProcessGroupError }] = useMutation(
    CREATE_PROCESS_GROUP_MUTATION,
    {
      variables: { name: newProcessGroup.name },
      onCompleted: (response) => {
        if (!response.createProcessGroup.message) {
          alert(`Process group "${newProcessGroup.name}" created successfully!`);
          setNewProcessGroup({ name: '' }); // Reset the input field
        } else {
          alert(`Error: ${response.createProcessGroup.message}`);
        }
      },
      onError: (mutationError) => {
        console.error('Create Process Group Mutation Error:', mutationError);
        alert('An unexpected error occurred while creating the process group.');
      },
    }
  );
  
  const [createNodeGroup, { data: createNodeGroupData, loading: createNodeGroupLoading, error: createNodeGroupError }] = useMutation(
    CREATE_NODE_GROUP_MUTATION,
    {
      variables: { name: newNodeGroup.name },
      onCompleted: (response) => {
        if (!response.createNodeGroup.message) {
          alert(`Node group "${newNodeGroup.name}" created successfully!`);
          setNewNodeGroup({ name: '' }); // Reset the input field
        } else {
          alert(`Error: ${response.createNodeGroup.message}`);
        }
      },
      onError: (mutationError) => {
        console.error('Create Node Group Mutation Error:', mutationError);
        alert('An unexpected error occurred while creating the node group.');
      },
    }
  );

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

        // Mutation hook for creating a new node history
  const [
    createNodeHistory,
    { data: createNodeHistoryData, loading: createNodeHistoryLoading, error: createNodeHistoryError },
  ] = useMutation(CREATE_NODE_HISTORY_MUTATION, {
    variables: { nodeName: nodeNameForHistory },
    onCompleted: (response) => {
      // The response from the server is in response.createNodeHistory with an "errors" array
      if (response.createNodeHistory.errors.length === 0) {
        alert(`Node history created successfully for node "${nodeNameForHistory}"!`);
        // Optionally refetch or update the cache
      } else {
        // If the "errors" array has items, we handle validation errors:
        const errorMessages = response.createNodeHistory.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('\n');
        alert(`Validation Errors:\n${errorMessages}`);
      }
    },
    onError: (mutationError) => {
      // Handle unexpected or network errors
      console.error('Create Node History Mutation Error:', mutationError);
      alert('An unexpected error occurred while creating node history.');
    },
  });

    // Mutation hook for creating a new Market
    const [
        createMarket,
        { data: createMarketData, loading: createMarketLoading, error: createMarketError }
      ] = useMutation(CREATE_MARKET_MUTATION, {
        onCompleted: (response) => {
          if (response.createMarket.errors.length === 0) {
            alert('Market created successfully!');
            // Optionally, trigger a refetch or update cache here
          } else {
            // Handle validation errors
            const errorMessages = response.createMarket.errors
              .map((err) => `${err.field}: ${err.message}`)
              .join('\n');
            alert(`Validation Errors:\n${errorMessages}`);
          }
        },
        onError: (mutationError) => {
          // Handle unexpected or network errors
          console.error('Create Market Mutation Error:', mutationError);
          alert('An unexpected error occurred while creating the market.');
        },
      });

      const handleMarketFormSubmit = (e) => {
        e.preventDefault();
        createMarket({ variables: { market: marketForm } });
        closeMarketModal();
      };
      

        // Mutation hook for creating a node diffusion
  const [
    createNodeDiffusion,
    { data: createNodeDiffusionData, loading: createNodeDiffusionLoading, error: createNodeDiffusionError },
  ] = useMutation(CREATE_NODE_DIFFUSION_MUTATION, {
    variables: newDiffusion, // The mutation requires { fromNode, toNode, coefficient }
    onCompleted: (response) => {
      // The response has an "errors" array under createNodeDiffusion
      if (response.createNodeDiffusion.errors.length === 0) {
        alert('Node diffusion created successfully!');
        // Optionally refetch or update cache here
      } else {
        // Validation errors returned from the server
        const errorMessages = response.createNodeDiffusion.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('\n');
        alert(`Validation Errors:\n${errorMessages}`);
      }
    },
    onError: (mutationError) => {
      // Handle unexpected or network errors
      console.error('Create Node Diffusion Mutation Error:', mutationError);
      alert('An unexpected error occurred while creating node diffusion.');
    },
  });

    // useMutation hook for creating a new risk
    const [
        createRisk,
        { data: createRiskData, loading: createRiskLoading, error: createRiskError }
      ] = useMutation(CREATE_RISK_MUTATION, {
        variables: { risk: newRisk },
        onCompleted: (response) => {
          // If there are no validation errors, the creation was successful
          if (response.createRisk.errors.length === 0) {
            alert('Risk created successfully!');
            // Optionally, trigger a refetch or update cache here
          } else {
            // Handle validation errors
            const errorMessages = response.createRisk.errors
              .map((err) => `${err.field}: ${err.message}`)
              .join('\n');
            alert(`Validation Errors:\n${errorMessages}`);
          }
        },
        onError: (mutationError) => {
          // Handle unexpected errors (e.g., network issues)
          console.error('Create Risk Mutation Error:', mutationError);
          alert('An unexpected error occurred while creating the risk.');
        },
      });

        // Mutation hook for creating a new generic constraint
  const [
    createGenConstraint,
    { data: createGenConstraintData, loading: createGenConstraintLoading, error: createGenConstraintError },
  ] = useMutation(CREATE_GEN_CONSTRAINT_MUTATION, {
    variables: { constraint: newGenConstraint },
    onCompleted: (response) => {
      // The response from the server is in response.createGenConstraint with an "errors" array
      if (response.createGenConstraint.errors.length === 0) {
        alert('Generic Constraint created successfully!');
        // Optionally refetch or update cache here
      } else {
        // Handle validation errors
        const errorMessages = response.createGenConstraint.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('\n');
        alert(`Validation Errors:\n${errorMessages}`);
      }
    },
    onError: (mutationError) => {
      // Handle unexpected or network errors
      console.error('Create Generic Constraint Mutation Error:', mutationError);
      alert('An unexpected error occurred while creating the generic constraint.');
    },
  });

    // Mutation hook for creating a new flow constraint factor
    const [
        createFlowConFactor,
        { data: createFlowConFactorData, loading: createFlowConFactorLoading, error: createFlowConFactorError },
      ] = useMutation(CREATE_FLOW_CON_FACTOR_MUTATION, {
        variables: newFlowConFactor,
        onCompleted: (response) => {
          if (response.createFlowConFactor.errors.length === 0) {
            alert('Flow Constraint Factor created successfully!');
            // Optionally, trigger a refetch or update cache here
          } else {
            // If the "errors" array has items, handle validation errors
            const errorMessages = response.createFlowConFactor.errors
              .map((err) => `${err.field}: ${err.message}`)
              .join('\n');
            alert(`Validation Errors:\n${errorMessages}`);
          }
        },
        onError: (mutationError) => {
          // Handle unexpected or network errors
          console.error('Create Flow Con Factor Mutation Error:', mutationError);
          alert('An unexpected error occurred while creating the Flow Constraint Factor.');
        },
      });

        // Mutation hook for creating a new State Constraint Factor
  const [
    createStateConFactor,
    { data: createStateConFactorData, loading: createStateConFactorLoading, error: createStateConFactorError },
  ] = useMutation(CREATE_STATE_CON_FACTOR_MUTATION, {
    variables: newStateConFactor,
    onCompleted: (response) => {
      if (response.createStateConFactor.errors.length === 0) {
        alert('State Constraint Factor created successfully!');
        // Optionally, trigger a refetch or update cache here
      } else {
        // Handle validation errors
        const errorMessages = response.createStateConFactor.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('\n');
        alert(`Validation Errors:\n${errorMessages}`);
      }
    },
    onError: (mutationError) => {
      // Handle unexpected or network errors
      console.error('Create State Con Factor Mutation Error:', mutationError);
      alert('An unexpected error occurred while creating the State Constraint Factor.');
    },
  });

    // Mutation hook for creating a new Online Constraint Factor
    const [
        createOnlineConFactor,
        { data: createOnlineConFactorData, loading: createOnlineConFactorLoading, error: createOnlineConFactorError },
      ] = useMutation(CREATE_ONLINE_CON_FACTOR_MUTATION, {
        variables: newOnlineConFactor,
        onCompleted: (response) => {
          if (response.createOnlineConFactor.errors.length === 0) {
            alert('Online Constraint Factor created successfully!');
            // Optionally, trigger a refetch or update the cache here
          } else {
            // If there are validation errors, display them
            const errorMessages = response.createOnlineConFactor.errors
              .map((err) => `${err.field}: ${err.message}`)
              .join('\n');
            alert(`Validation Errors:\n${errorMessages}`);
          }
        },
        onError: (mutationError) => {
          // Handle unexpected or network errors
          console.error('Create Online Con Factor Mutation Error:', mutationError);
          alert('An unexpected error occurred while creating the Online Constraint Factor.');
        },
      });

      const [addProcessToGroup, { data: addProcessToGroupData, loading: addProcessToGroupLoading, error: addProcessToGroupError }] = useMutation(
        ADD_PROCESS_TO_GROUP_MUTATION,
        {
          variables: {
            processName: processForm.name,
            groupName: newProcessGroup.name, // Access the 'name' property
          },
          onCompleted: (response) => {
            if (!response.addProcessToGroup.message) {
              alert(`Process "${processForm.name}" added to group "${newProcessGroup.name}" successfully!`);
            } else {
              alert(`Error: ${response.addProcessToGroup.message}`);
            }
          },
          onError: (mutationError) => {
            console.error('Add Process to Group Mutation Error:', mutationError);
            alert('An unexpected error occurred while adding the process to the group.');
          },
        }
      );
      
      const [addNodeToGroup, { data: addNodeToGroupData, loading: addNodeToGroupLoading, error: addNodeToGroupError }] = useMutation(
        ADD_NODE_TO_GROUP_MUTATION,
        {
          variables: {
            nodeName: nodeForm.name,
            groupName: newNodeGroup.name, // Access the 'name' property
          },
          onCompleted: (response) => {
            if (!response.addNodeToGroup.message) {
              alert(`Node "${nodeForm.name}" added to group "${newNodeGroup.name}" successfully!`);
            } else {
              alert(`Error: ${response.addNodeToGroup.message}`);
            }
          },
          onError: (mutationError) => {
            console.error('Add Node to Group Mutation Error:', mutationError);
            alert('An unexpected error occurred while adding the node to the group.');
          },
        }
      );
      
      
      const [
        startElectricityPriceFetch,
        { data: electricityPriceFetchData, loading: electricityPriceFetchLoading, error: electricityPriceFetchError }
      ] = useMutation(START_ELECTRICITY_PRICE_FETCH_MUTATION, {
        onCompleted: (response) => {
          // This mutation returns an Int (the job ID).
          // Example: "startElectricityPriceFetch: Int!"
          alert(`Electricity price fetch started. Job ID: ${response.startElectricityPriceFetch}`);
        },
        onError: (mutationError) => {
          console.error('Start Electricity Price Fetch Mutation Error:', mutationError);
          alert('An unexpected error occurred while starting the electricity price fetch job.');
        },
      });

      const [
        startWeatherForecastFetch,
        { data: weatherForecastFetchData, loading: weatherForecastFetchLoading, error: weatherForecastFetchError },
      ] = useMutation(START_WEATHER_FORECAST_FETCH_MUTATION, {
        onCompleted: (response) => {
          // This mutation returns an Int (the job ID) when successful.
          // Example: "startWeatherForecastFetch: Int!"
          alert(`Weather forecast fetch started. Job ID: ${response.startWeatherForecastFetch}`);
        },
        onError: (mutationError) => {
          console.error('Start Weather Forecast Fetch Mutation Error:', mutationError);
          alert('An unexpected error occurred while starting the weather forecast job.');
        },
      });

      const [updateNodeState, { data: updateNodeStateData, loading: updateNodeStateLoading, error: updateNodeStateError }] = useMutation(
        UPDATE_NODE_STATE_MUTATION,
        {
          onCompleted: (response) => {
            if (response.updateNodeState.errors.length === 0) {
              alert(`Node "${targetNodeName}" state updated successfully!`);
              closeStateModal(); // Close the modal on success
              // Optionally, trigger a refetch or update cache here
            } else {
              // If there's any validation error, show them
              const errorMessages = response.updateNodeState.errors
                .map((err) => `${err.field}: ${err.message}`)
                .join('\n');
              alert(`Validation Errors:\n${errorMessages}`);
            }
          },
          onError: (mutationError) => {
            // Handle unexpected or network errors
            console.error('Update Node State Mutation Error:', mutationError);
            alert('An unexpected error occurred while updating the node state.');
          },
        }
      );
    
      // 5. Handle form submission from the StateModal
      const handleStateFormSubmit = (e) => {
        e.preventDefault();
        // Trigger the mutation with updated values
        updateNodeState({
          variables: {
            nodeName: targetNodeName, // Ensure this is the correct node name
            state: stateForm,
          },
        });
      };

        // 1) Define the mutation hook
  const [
    connectNodeInflowToTemperatureForecast,
    { data: connectForecastData, loading: connectForecastLoading, error: connectForecastError },
  ] = useMutation(CONNECT_NODE_INFLOW_TO_TEMPERATURE_FORECAST_MUTATION, {
    variables: {
      nodeName: newNode.name,  // 'Node Alpha'
      forecastName: temperatureForecastName, // 'TemperatureForecastAlpha'
    },
    onCompleted: (response) => {
      // The mutation returns MaybeError with a "message" field
      if (!response.connectNodeInflowToTemperatureForecast.message) {
        // No message means success
        alert(`Node "${newNode.name}" inflow connected to forecast "${temperatureForecastName}" successfully!`);
      } else {
        // If there's a message, treat it as an error
        alert(`Error: ${response.connectNodeInflowToTemperatureForecast.message}`);
      }
    },
    onError: (mutationError) => {
      // Handle unexpected or network errors
      console.error('Connect Node Inflow to Temperature Forecast Error:', mutationError);
      alert('An unexpected error occurred while connecting node inflow to the temperature forecast.');
    },
  });
  
  const [
    connectMarketPricesToForecast,
    { data: connectMarketData, loading: connectMarketLoading, error: connectMarketError },
  ] = useMutation(CONNECT_MARKET_PRICES_TO_FORECAST_MUTATION, {
    variables: {
      marketName: marketName,
      forecastName: marketForecastName,
    },
    onCompleted: (response) => {
      // The mutation returns MaybeError with a "message" field
      if (!response.connectMarketPricesToForecast.message) {
        // no message means success
        alert(`Market "${marketName}" prices connected to forecast "${marketForecastName}" successfully!`);
      } else {
        // If there's a message, treat it as an error
        alert(`Error: ${response.connectMarketPricesToForecast.message}`);
      }
    },
    onError: (mutationError) => {
      // Handle unexpected or network errors
      console.error('Connect Market Prices to Forecast Error:', mutationError);
      alert('An unexpected error occurred while connecting the market prices to the forecast.');
    },
  });

  const [
    clearInputData,
    { data: clearData, loading: clearLoading, error: clearError },
  ] = useMutation(CLEAR_INPUT_DATA_MUTATION, {
    onCompleted: (response) => {
      // The mutation returns MaybeError with a "message" field
      if (!response.clearInputData.message) {
        // No message means success
        alert('All input data has been cleared from the model successfully!');
        // Optionally, trigger a refetch or update your cache
      } else {
        // If there's a message, treat it as an error
        alert(`Error: ${response.clearInputData.message}`);
      }
    },
    onError: (mutationError) => {
      // Handle unexpected or network errors
      console.error('Clear Input Data Mutation Error:', mutationError);
      alert('An unexpected error occurred while clearing the input data.');
    },
  });

  const [
    saveModel,
    { data: saveModelData, loading: saveModelLoading, error: saveModelError },
  ] = useMutation(SAVE_MODEL_MUTATION, {
    onCompleted: (response) => {
      // The mutation returns MaybeError with a "message" field
      if (!response.saveModel.message) {
        // No message = success
        alert('Model saved successfully on disk!');
        // Optionally, trigger a refetch or update the cache
      } else {
        // If there's a message, treat it as an error
        alert(`Error: ${response.saveModel.message}`);
      }
    },
    onError: (mutationError) => {
      // Handle unexpected or network errors
      console.error('Save Model Mutation Error:', mutationError);
      alert('An unexpected error occurred while saving the model on disk.');
    },
  });

  // Step 1: Keep local React state for job ID
  const [optimizationJobId, setOptimizationJobId] = useState(null);

  // The mutation for startOptimization
  const [startOptimization, { data: optimizationData, loading: optimizationLoading, error: optimizationError }] = 
    useMutation(START_OPTIMIZATION_MUTATION, {
      onCompleted: (response) => {
        // response.startOptimization is your job ID
        const jobId = response.startOptimization;
        alert(`Optimization started! Job ID: ${jobId}`);
        setOptimizationJobId(jobId);  // <-- store the jobId in state
      },
      onError: (mutationError) => {
        console.error('Start Optimization Mutation Error:', mutationError);
        alert('An unexpected error occurred while starting optimization.');
      },
    });

    // If you want to poll every 2 seconds:
const { data: jobStatusData, loading: jobStatusLoading, error: jobStatusError } = useQuery(
    JOB_STATUS_QUERY,
    {
      skip: !optimizationJobId,        // Don’t run until we have a job ID
      variables: { jobId: optimizationJobId },
      pollInterval: 2000,              // Poll every 2 seconds
    }
  );


    // Handler for creating a new Market
    const handleCreateMarket = () => {
        createMarket();
    };

  // Handler for creating a new process
  const handleCreateProcess = () => {
    createProcess();
  };

  // Handler for creating a new node
  const handleCreateNode = () => {
    createNode();
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

// Handler for creating node history
  const handleCreateNodeHistory = () => {
    createNodeHistory();
  };

// Button handler
const handleCreateNodeDiffusion = () => {
    createNodeDiffusion();
};

// Handler for creating a new risk
const handleCreateRisk = () => {
createRisk();
};

  // Handler for creating a generic constraint
  const handleCreateGenConstraint = () => {
    createGenConstraint();
  };

// Handler for creating a Flow Constraint Factor
const handleCreateFlowConFactor = () => {
    createFlowConFactor();
    };

      // Handler function to create a State Constraint Factor
  const handleCreateStateConFactor = () => {
    createStateConFactor();
  };

    // Handler function to create an Online Constraint Factor
    const handleCreateOnlineConFactor = () => {
        createOnlineConFactor();
      };

      // Handler function for the button
      const handleAddProcessToGroup = () => {
        addProcessToGroup();
      };

      const handleAddNodeToGroup = () => {
        addNodeToGroup();
      };

      const handleStartElectricityPriceFetch = () => {
        startElectricityPriceFetch();
      };

      const handleStartWeatherForecastFetch = () => {
        startWeatherForecastFetch();
      };

      const handleUpdateNodeState = () => {
        updateNodeState();
      };

      const handleConnectNodeInflow = () => {
        connectNodeInflowToTemperatureForecast();
      };

      const handleConnectMarketPrices = () => {
        connectMarketPricesToForecast();
      };

      const handleClearInputData = () => {
  clearInputData(); // Just call the mutate function
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProcessForm({
          ...processForm,
          [name]: type === 'checkbox' ? checked : value,
        });
      };
    
      // Handler for creating a process using form data
      const handleFormSubmit = (e) => {
        e.preventDefault();
        createProcess({ variables: { process: processForm } });
      };


  return (
    <div style={styles.container}>
      <h2>GraphQL Actions</h2>

      {/* A button to open the “Add / Update Input Setup” modal */}
      <div style={styles.actionSection}>
        <h3>Add / Update Input Setup</h3>
        <button onClick={openInputSetupModal} style={styles.button}>
          {updateLoading ? 'Saving...' : 'Add Input Setup'}
        </button>
      </div>

      <div style={styles.actionSection}>
        <h3>Create New Process</h3>
        <button onClick={openProcessModal} style={styles.button}>
          Add New Process
        </button>
      </div>

      {/* Node Section */}
      <div style={styles.actionSection}>
        <h3>Create New Node</h3>
        {/* Instead of calling createNode() directly, let's open the modal */}
        <button onClick={openNodeModal} style={styles.button}>
          Add New Node
        </button>
      </div>

      {/* Show success/error messages from createNode if desired */}
      {createNodeError && <p style={styles.error}>Error: {createNodeError.message}</p>}
      {createNodeData && createNodeData.createNode.errors.length === 0 && (
        <p style={styles.success}>Node created successfully!</p>
      )}

      <div style={styles.actionSection}>
        <h3>Add New Scenario</h3>
        <button onClick={openAddScenarioModal} style={styles.button}>
          Add Scenario
        </button>
      </div>

      <div style={styles.actionSection}>
        <h3>Create and Assign State to Node</h3>
        <button onClick={openStateModal} style={styles.button} disabled={nodeLoading || nodeError}>
          Add New State
        </button>
        {nodeLoading && <p>Loading nodes...</p>}
        {nodeError && <p style={styles.error}>Error loading nodes: {nodeError.message}</p>}
      </div>

      <div style={styles.actionSection}>
        <h3>Create New Node Group</h3>
        <form onSubmit={handleCreateNodeGroup} className={styles.form}>
            <label className={styles.label}>
            Group Name:
            <input
                type="text"
                name="name"
                value={newNodeGroup.name}
                onChange={(e) => setNewNodeGroup({ ...newNodeGroup, name: e.target.value })}
                required
                className={styles.input}
                placeholder="Enter Node Group Name"
            />
            </label>
            <button type="submit" disabled={createNodeGroupLoading} style={styles.button}>
            {createNodeGroupLoading ? 'Creating...' : 'Create Node Group'}
            </button>
        </form>

        {/* Display Success or Error Messages */}
        {createNodeGroupError && <p style={styles.error}>Error: {createNodeGroupError.message}</p>}
        {createNodeGroupData && !createNodeGroupData.createNodeGroup.message && (
            <p style={styles.success}>Node group "{newNodeGroup.name}" created successfully!</p>
        )}
        {createNodeGroupData && createNodeGroupData.createNodeGroup.message && (
            <p style={styles.error}>Error: {createNodeGroupData.createNodeGroup.message}</p>
        )}
        </div>

        <div style={styles.actionSection}>
        <h3>Create New Process Group</h3>
        <form onSubmit={handleCreateProcessGroup} className={styles.form}>
            <label className={styles.label}>
            Group Name:
            <input
                type="text"
                name="name"
                value={newProcessGroup.name}
                onChange={(e) => setNewProcessGroup({ ...newProcessGroup, name: e.target.value })}
                required
                className={styles.input}
                placeholder="Enter Process Group Name"
            />
            </label>
            <button type="submit" disabled={createProcessGroupLoading} style={styles.button}>
            {createProcessGroupLoading ? 'Creating...' : 'Create Process Group'}
            </button>
        </form>

        {/* Display Success or Error Messages */}
        {createProcessGroupError && <p style={styles.error}>Error: {createProcessGroupError.message}</p>}
        {createProcessGroupData && !createProcessGroupData.createProcessGroup.message && (
            <p style={styles.success}>Process group "{newProcessGroup.name}" created successfully!</p>
        )}
        {createProcessGroupData && createProcessGroupData.createProcessGroup.message && (
            <p style={styles.error}>Error: {createProcessGroupData.createProcessGroup.message}</p>
        )}
        </div>

      {/* Add New Topology Section */}
      <div style={styles.actionSection}>
        <h3>Add New Topology</h3>
        <button onClick={openTopologyModal} style={styles.button}>
          Add New Topology
        </button>
      </div>
      
      {/* Create Node Delay Section with Modal */}
      <div style={styles.actionSection}>
        <h3>Create Node Delay</h3>
        <button onClick={openNodeDelayModal} style={styles.button}>
          Add Node Delay
        </button>
      </div>

            {/* Create Node History Section */}
    <div style={styles.actionSection}>
        <h3>Create Node History</h3>
        <button
          onClick={handleCreateNodeHistory}
          disabled={createNodeHistoryLoading}
          style={styles.button}
        >
          {createNodeHistoryLoading ? 'Creating...' : `Create History for "${nodeNameForHistory}"`}
        </button>

        {/* Network or unexpected error */}
        {createNodeHistoryError && (
          <p style={styles.error}>Error: {createNodeHistoryError.message}</p>
        )}

        {/* Check if creation was successful */}
        {createNodeHistoryData && createNodeHistoryData.createNodeHistory.errors.length === 0 && (
          <p style={styles.success}>
            Node history created successfully for node "{nodeNameForHistory}"!
          </p>
        )}

        {/* Validation errors from backend */}
        {createNodeHistoryData && createNodeHistoryData.createNodeHistory.errors.length > 0 && (
          <div style={styles.error}>
            <h4>Validation Errors:</h4>
            <ul>
              {createNodeHistoryData.createNodeHistory.errors.map((err, index) => (
                <li key={index}>{`${err.field}: ${err.message}`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
            {/* Create New Market Section */}
            <div style={styles.actionSection}>
        <h3>Create New Market</h3>
        <button
          onClick={openMarketModal}
          style={styles.button}
        >
            Add New Market
        </button>

        {createMarketError && (
          <p style={styles.error}>Error: {createMarketError.message}</p>
        )}

        {createMarketData && createMarketData.createMarket.errors.length === 0 && (
          <p style={styles.success}>Market created successfully!</p>
        )}

        {createMarketData && createMarketData.createMarket.errors.length > 0 && (
          <div style={styles.error}>
            <h4>Validation Errors:</h4>
            <ul>
              {createMarketData.createMarket.errors.map((err, index) => (
                <li key={index}>
                  {err.field}: {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Create Node Diffusion Section */}
      <div style={styles.actionSection}>
        <h3>Create Node Diffusion</h3>
        <button
          onClick={handleCreateNodeDiffusion}
          disabled={createNodeDiffusionLoading}
          style={styles.button}
        >
          {createNodeDiffusionLoading ? 'Creating...' : 'Create Node Diffusion'}
        </button>

        {createNodeDiffusionError && (
          <p style={styles.error}>Error: {createNodeDiffusionError.message}</p>
        )}

        {/* Successful creation */}
        {createNodeDiffusionData && createNodeDiffusionData.createNodeDiffusion.errors.length === 0 && (
          <p style={styles.success}>Node diffusion created successfully!</p>
        )}

        {/* Validation errors */}
        {createNodeDiffusionData && createNodeDiffusionData.createNodeDiffusion.errors.length > 0 && (
          <div style={styles.error}>
            <h4>Validation Errors:</h4>
            <ul>
              {createNodeDiffusionData.createNodeDiffusion.errors.map((err, index) => (
                <li key={index}>{`${err.field}: ${err.message}`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
            {/* Create New Risk Section */}
            <div style={styles.actionSection}>
        <h3>Create New Risk</h3>
        <button onClick={handleCreateRisk} disabled={createRiskLoading} style={styles.button}>
          {createRiskLoading ? 'Creating...' : 'Create New Risk'}
        </button>

        {/* Show network error if any */}
        {createRiskError && (
          <p style={styles.error}>Error: {createRiskError.message}</p>
        )}

        {/* Successful creation */}
        {createRiskData && createRiskData.createRisk.errors.length === 0 && (
          <p style={styles.success}>Risk created successfully!</p>
        )}

        {/* Validation errors */}
        {createRiskData && createRiskData.createRisk.errors.length > 0 && (
          <div style={styles.error}>
            <h4>Validation Errors:</h4>
            <ul>
              {createRiskData.createRisk.errors.map((err, index) => (
                <li key={index}>{`${err.field}: ${err.message}`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Create Generic Constraint Section */}
      <div style={styles.actionSection}>
        <h3>Create Generic Constraint</h3>
        <button
          onClick={handleCreateGenConstraint}
          disabled={createGenConstraintLoading}
          style={styles.button}
        >
          {createGenConstraintLoading ? 'Creating...' : 'Create Generic Constraint'}
        </button>

        {/* Network or unexpected error */}
        {createGenConstraintError && (
          <p style={styles.error}>Error: {createGenConstraintError.message}</p>
        )}

        {/* Successful creation */}
        {createGenConstraintData &&
          createGenConstraintData.createGenConstraint.errors.length === 0 && (
            <p style={styles.success}>Generic Constraint created successfully!</p>
          )}

        {/* Validation errors from backend */}
        {createGenConstraintData &&
          createGenConstraintData.createGenConstraint.errors.length > 0 && (
            <div style={styles.error}>
              <h4>Validation Errors:</h4>
              <ul>
                {createGenConstraintData.createGenConstraint.errors.map((err, index) => (
                  <li key={index}>{`${err.field}: ${err.message}`}</li>
                ))}
              </ul>
            </div>
          )}
      </div>
      {/* Create Flow Constraint Factor Section */}
      <div style={styles.actionSection}>
        <h3>Create Flow Constraint Factor</h3>
        <button
          onClick={handleCreateFlowConFactor}
          disabled={createFlowConFactorLoading}
          style={styles.button}
        >
          {createFlowConFactorLoading ? 'Creating...' : 'Create Flow Con Factor'}
        </button>

        {/* Network or unexpected error */}
        {createFlowConFactorError && (
          <p style={styles.error}>Error: {createFlowConFactorError.message}</p>
        )}

        {/* Successful creation */}
        {createFlowConFactorData &&
          createFlowConFactorData.createFlowConFactor.errors.length === 0 && (
            <p style={styles.success}>Flow Constraint Factor created successfully!</p>
          )}

        {/* Validation errors from backend */}
        {createFlowConFactorData &&
          createFlowConFactorData.createFlowConFactor.errors.length > 0 && (
            <div style={styles.error}>
              <h4>Validation Errors:</h4>
              <ul>
                {createFlowConFactorData.createFlowConFactor.errors.map((err, index) => (
                  <li key={index}>{`${err.field}: ${err.message}`}</li>
                ))}
              </ul>
            </div>
          )}
      </div>
       {/* Create State Constraint Factor Section */}
       <div style={styles.actionSection}>
        <h3>Create State Constraint Factor</h3>
        <button
          onClick={handleCreateStateConFactor}
          disabled={createStateConFactorLoading}
          style={styles.button}
        >
          {createStateConFactorLoading ? 'Creating...' : 'Create State Con Factor'}
        </button>

        {createStateConFactorError && (
          <p style={styles.error}>Error: {createStateConFactorError.message}</p>
        )}

        {/* Successful creation */}
        {createStateConFactorData && createStateConFactorData.createStateConFactor.errors.length === 0 && (
          <p style={styles.success}>State Constraint Factor created successfully!</p>
        )}

        {/* Validation errors */}
        {createStateConFactorData && createStateConFactorData.createStateConFactor.errors.length > 0 && (
          <div style={styles.error}>
            <h4>Validation Errors:</h4>
            <ul>
              {createStateConFactorData.createStateConFactor.errors.map((err, index) => (
                <li key={index}>{`${err.field}: ${err.message}`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Create Online Constraint Factor Section */}
      <div style={styles.actionSection}>
        <h3>Create Online Constraint Factor</h3>
        <button
          onClick={handleCreateOnlineConFactor}
          disabled={createOnlineConFactorLoading}
          style={styles.button}
        >
          {createOnlineConFactorLoading ? 'Creating...' : 'Create Online Con Factor'}
        </button>

        {createOnlineConFactorError && (
          <p style={styles.error}>Error: {createOnlineConFactorError.message}</p>
        )}

        {/* Successful creation */}
        {createOnlineConFactorData &&
          createOnlineConFactorData.createOnlineConFactor.errors.length === 0 && (
            <p style={styles.success}>Online Constraint Factor created successfully!</p>
          )}

        {/* Validation errors */}
        {createOnlineConFactorData &&
          createOnlineConFactorData.createOnlineConFactor.errors.length > 0 && (
            <div style={styles.error}>
              <h4>Validation Errors:</h4>
              <ul>
                {createOnlineConFactorData.createOnlineConFactor.errors.map((err, index) => (
                  <li key={index}>{`${err.field}: ${err.message}`}</li>
                ))}
              </ul>
            </div>
          )}
      </div>
      {/* Add Process to Group Section */}
      <div style={styles.actionSection}>
        <h3>Add Process to Group</h3>
        <button 
          onClick={handleAddProcessToGroup} 
          disabled={addProcessToGroupLoading} 
          style={styles.button}
        >
          {addProcessToGroupLoading ? 'Adding...' : 'Add Process to Group'}
        </button>

        {addProcessToGroupError && (
          <p style={styles.error}>Error: {addProcessToGroupError.message}</p>
        )}
        
        {/* Successful addition */}
        {addProcessToGroupData && !addProcessToGroupData.addProcessToGroup.message && (
          <p style={styles.success}>
            Process "{processForm.name}" added to group "{newProcessGroup.name}" successfully!
          </p>
        )}

        {/* Error/Validation message from server */}
        {addProcessToGroupData && addProcessToGroupData.addProcessToGroup.message && (
          <p style={styles.error}>Error: {addProcessToGroupData.addProcessToGroup.message}</p>
        )}
      </div>
            {/* Add Node to Group Section */}
            <div style={styles.actionSection}>
        <h3>Add Node to Group</h3>
        <button
          onClick={handleAddNodeToGroup}
          disabled={addNodeToGroupLoading}
          style={styles.button}
        >
          {addNodeToGroupLoading ? 'Adding...' : 'Add Node to Group'}
        </button>

        {/* Network/Unexpected Error */}
        {addNodeToGroupError && (
          <p style={styles.error}>Error: {addNodeToGroupError.message}</p>
        )}

        {/* Success: no message means success */}
        {addNodeToGroupData && !addNodeToGroupData.addNodeToGroup.message && (
          <p style={styles.success}>
            Node "{newNode.name}" added to group "{newNodeGroup.name}" successfully!
          </p>
        )}

        {/* Server reported an error */}
        {addNodeToGroupData && addNodeToGroupData.addNodeToGroup.message && (
          <p style={styles.error}>Error: {addNodeToGroupData.addNodeToGroup.message}</p>
        )}
      </div>
      <div style={styles.actionSection}>
        <h3>Start Electricity Price Fetch</h3>
        <button
          onClick={handleStartElectricityPriceFetch}
          disabled={electricityPriceFetchLoading}
          style={styles.button}
        >
          {electricityPriceFetchLoading ? 'Starting...' : 'Start Electricity Price Fetch'}
        </button>

        {/* If there's an unexpected error (network, etc.) */}
        {electricityPriceFetchError && (
          <p style={styles.error}>Error: {electricityPriceFetchError.message}</p>
        )}

        {/* Show the returned job ID if desired */}
        {electricityPriceFetchData && (
          <p style={styles.success}>
            Job started with ID: {electricityPriceFetchData.startElectricityPriceFetch}
          </p>
        )}
      </div>

      <div style={styles.actionSection}>
        <h3>Start Weather Forecast Fetch</h3>
        <button
          onClick={handleStartWeatherForecastFetch}
          disabled={weatherForecastFetchLoading}
          style={styles.button}
        >
          {weatherForecastFetchLoading ? 'Starting...' : 'Start Weather Forecast Fetch'}
        </button>

        {/* If there's an unexpected error (network or otherwise) */}
        {weatherForecastFetchError && (
          <p style={styles.error}>Error: {weatherForecastFetchError.message}</p>
        )}

        {/* Show the returned job ID on success, if desired */}
        {weatherForecastFetchData && (
          <p style={styles.success}>
            Weather forecast fetch job started with ID: {weatherForecastFetchData.startWeatherForecastFetch}
          </p>
        )}
      </div>
            {/* Connect Node Inflow to Temperature Forecast Section */}
            <div style={styles.actionSection}>
        <h3>Connect Node Inflow to Temperature Forecast</h3>
        <button
          onClick={handleConnectNodeInflow}
          disabled={connectForecastLoading}
          style={styles.button}
        >
          {connectForecastLoading ? 'Connecting...' : `Connect "${newNode.name}" to "${temperatureForecastName}"`}
        </button>

        {/* If there's a network/unexpected error */}
        {connectForecastError && (
          <p style={styles.error}>Error: {connectForecastError.message}</p>
        )}

        {/* If successful and no message from the server => success */}
        {connectForecastData && !connectForecastData.connectNodeInflowToTemperatureForecast.message && (
          <p style={styles.success}>
            Node "{newNode.name}" inflow connected to forecast "{temperatureForecastName}" successfully!
          </p>
        )}

        {/* If the server returned an error message */}
        {connectForecastData && connectForecastData.connectNodeInflowToTemperatureForecast.message && (
          <p style={styles.error}>
            Error: {connectForecastData.connectNodeInflowToTemperatureForecast.message}
          </p>
        )}
      </div>
      <div style={styles.actionSection}>
  <h3>Connect Market Prices to Forecast</h3>
  <button
    onClick={handleConnectMarketPrices}
    disabled={connectMarketLoading}
    style={styles.button}
  >
    {connectMarketLoading
      ? 'Connecting...'
      : `Connect "${marketName}" to "${marketForecastName}"`}
  </button>

  {/* If there's a network/unexpected error */}
  {connectMarketError && (
    <p style={styles.error}>Error: {connectMarketError.message}</p>
  )}

  {/* If successful and no message from the server => success */}
  {connectMarketData && !connectMarketData.connectMarketPricesToForecast.message && (
    <p style={styles.success}>
      Market "{marketName}" connected to forecast "{marketForecastName}" successfully!
    </p>
  )}

  {/* If the server returned an error message */}
  {connectMarketData && connectMarketData.connectMarketPricesToForecast.message && (
    <p style={styles.error}>
      Error: {connectMarketData.connectMarketPricesToForecast.message}
    </p>
  )}
</div>
<div style={styles.actionSection}>
  <h3>Clear Input Data</h3>
  <button
    onClick={handleClearInputData}
    disabled={clearLoading}
    style={styles.button}
  >
    {clearLoading ? 'Clearing...' : 'Clear All Input Data'}
  </button>

  {/* If there's a network/unexpected error */}
  {clearError && (
    <p style={styles.error}>Error: {clearError.message}</p>
  )}

  {/* If the server response had no message => success */}
  {clearData && !clearData.clearInputData.message && (
    <p style={styles.success}>All input data cleared successfully!</p>
  )}

  {/* If there's a server error message */}
  {clearData && clearData.clearInputData.message && (
    <p style={styles.error}>Error: {clearData.clearInputData.message}</p>
  )}
</div>
<div style={styles.actionSection}>
  <h3>Save Model on Disk</h3>
  <button
    onClick={() => saveModel()}       // Call the mutate function
    disabled={saveModelLoading}
    style={styles.button}
  >
    {saveModelLoading ? 'Saving...' : 'Save Model to Disk'}
  </button>

  {/* If there's an unexpected error (e.g. network) */}
  {saveModelError && (
    <p style={styles.error}>Error: {saveModelError.message}</p>
  )}

  {/* If the server returns no message => success */}
  {saveModelData && !saveModelData.saveModel.message && (
    <p style={styles.success}>Model saved successfully on disk!</p>
  )}

  {/* If the server returns a message => error */}
  {saveModelData && saveModelData.saveModel.message && (
    <p style={styles.error}>Error: {saveModelData.saveModel.message}</p>
  )}
</div>
      {/* Section to Display Node Names */}
      <div style={styles.actionSection}>
        <h3>Node Names</h3>
        {nodeLoading && <p>Loading node names...</p>}
        {nodeError && <p style={styles.error}>Error: {nodeError.message}</p>}
        {nodeData && (
          <ul>
            {nodeData.model.inputData.nodes.map((node, index) => (
              <li key={index}>{node.name}</li>
            ))}
          </ul>
        )}
      </div>
<button onClick={() => startOptimization()}>
  {optimizationLoading ? 'Starting...' : 'Start Optimization'}
</button>

{optimizationJobId && (
  <div style={styles.actionSection}>
    <h3>Job Status for ID: {optimizationJobId}</h3>

    {jobStatusLoading && <p>Checking job status...</p>}
    {jobStatusError && <p style={styles.error}>Error: {jobStatusError.message}</p>}

    {/* If data is loaded, show the job state */}
    {jobStatusData?.jobStatus && (
      <>
        <p>State: {jobStatusData.jobStatus.state}</p>
        {jobStatusData.jobStatus.message && (
          <p>Message: {jobStatusData.jobStatus.message}</p>
        )}
      </>
    )}
  </div>
  
)}
      {/* The Input Setup Modal */}
      <InputSetupModal
        isOpen={isInputSetupModalOpen}
        onClose={closeInputSetupModal}
        loading={updateLoading}
        error={updateError}
        values={inputSetupForm}
        onChange={handleInputSetupChange}
        onSubmit={handleSubmitInputSetup}
      />
            {/* The Process Modal */}
            <ProcessModal
        isOpen={isProcessModalOpen}
        onClose={closeProcessModal}
        onSubmit={handleProcessFormSubmit}
        processForm={processForm}
        onChange={handleProcessFormChange}
        loading={createLoading}
        error={createError}
      />

            {/* The Node Modal */}
            <NodeModal
        isOpen={isNodeModalOpen}
        onClose={closeNodeModal}
        onSubmit={handleNodeFormSubmit}
        nodeForm={nodeForm}
        onChange={handleNodeFormChange}
        loading={createNodeLoading}
        error={createNodeError}
      />

        <MarketModal
        isOpen={isMarketModalOpen}
        onClose={closeMarketModal}
        onSubmit={handleMarketFormSubmit}
        marketForm={marketForm}
        onChange={handleMarketFormChange}
        loading={createMarketLoading}
        error={createMarketError}
        />

        <StateModal
        isOpen={isStateModalOpen}
        onClose={closeStateModal}
        nodes={nodes} // Pass node data
      />
        <AddScenarioModal
        isOpen={isAddScenarioModalOpen}
        onClose={closeAddScenarioModal}
      />

    <TopologyModal
        isOpen={isTopologyModalOpen}
        onClose={closeTopologyModal}
      />
    {/* Node Delay Modal */}
    <NodeDelayModal
        isOpen={isNodeDelayModalOpen}
        onClose={closeNodeDelayModal}
      />

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
