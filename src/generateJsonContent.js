// src/generateJsonContent.js

import Input_SetupData from './Input_SetupData';
import generateTemporalsData from './Input_Temporals'; // Import the temporals data generator
import generateProcessesData from './Input_Processes';
import generateNodesData from './Input_Nodes';
import generateNodeDiffusions from './Input_NodeDiffusion';
import generateMarketData from './Input_Markets';
import generateGroupsData from './Input_Groups';
import generateScenariosData from './Input_Scenarios';
import generateRiskData from './Input_Risk';
import generateGenConstraintsData from './Input_GenConstraints';
import generateBidSlotsData from './Input_BidSlots';

const generateJsonContent = (electricHeaters, rooms, activeDevices, sensorStates) => {
  // Generate temporals data
  const temporalsData = generateTemporalsData();
  const timestamps = temporalsData.temporals.t;

  // Generate setup data
  const setupData = Input_SetupData();

  // Filter active heaters and rooms based on user activity
  const activeHeaters = electricHeaters.filter((heater) => activeDevices[heater.id]);
  const activeRooms = rooms.filter((room) => activeDevices[room.sensorId]);

  // Generate processes data for active heaters (includes topologies)
  const processesData =
    activeHeaters.length > 0 ? { processes: generateProcessesData(activeHeaters) } : {};

  // Generate nodes data for active rooms (including envelope and soil nodes)
  const nodesData = { nodes: generateNodesData(activeRooms, sensorStates) };

  // Generate node diffusions and time-series data
  const nodeDiffusionsData = generateNodeDiffusions(activeRooms, timestamps);

  // Generate other relevant datasets
  const marketData = generateMarketData();
  const groupsData = generateGroupsData(activeHeaters);
  const scenariosData = generateScenariosData();
  const riskData = generateRiskData();
  const genConstraintsData = generateGenConstraintsData(activeRooms);
  const bidSlotsData = generateBidSlotsData();

  // Prepare empty datasets for placeholders
  const reserveType = { reserve_type: {} };
  const nodeDelay = { node_delay: [] }; // Specified as an empty list for compatibility
  const nodeHistories = { node_histories: {} };
  const inflowBlocks = { inflow_blocks: {} };

  // Combine all data into one final JSON object in the specified order
  const combinedData = {
    temporals: temporalsData.temporals,
    setup: setupData,
    processes: processesData.processes,
    nodes: nodesData.nodes,
    node_diffusion: nodeDiffusionsData.node_diffusion,
    node_delay: nodeDelay.node_delay,
    node_histories: nodeHistories.node_histories,
    markets: marketData.markets,
    groups: groupsData.groups,
    scenarios: scenariosData.scenarios,
    reserve_type: reserveType.reserve_type,
    risk: riskData.risk,
    inflow_blocks: inflowBlocks.inflow_blocks,
    bid_slots: bidSlotsData.bid_slots,
    gen_constraints: genConstraintsData.gen_constraints,
  };

  return combinedData;
};

export default generateJsonContent;
