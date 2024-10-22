// src/generateJsonContent.js

import Input_SetupData from './Input_SetupData';
import generateProcessesData from './Input_Processes';
import generateNodesData from './Input_Nodes';
import generateNodeDiffusions from './Input_NodeDiffusion';
import generateMarketData from './Input_Markets';
import generateGroupsData from './Input_Groups';
import generateScenariosData from './Input_Scenarios';
import generateRiskData from './Input_Risk';
import generateGenConstraintsData from './Input_GenConstraints';
import generateBidSlotsData from './Input_BidSlots';

const generateJsonContent = (electricHeaters, rooms, activeDevices) => {
  const startDate = new Date();
  let startHour = startDate.getHours();
  const currentMinutes = startDate.getMinutes();

  // If the current minutes are not 00, start from the next full hour
  if (currentMinutes > 0) {
    startHour += 1;
  }

  const timestamps = [];
  for (let i = 0; i < 12; i++) {
    const newDate = new Date(startDate);
    newDate.setHours(startHour + i);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    timestamps.push(newDate.toISOString());
  }

  const temporalsData = {
    temporals: {
      t: timestamps,
      dtf: 0.0,
      is_variable_dt: false,
      variable_dt: [], // Added for Rust Temporals structure compatibility
      ts_format: "",   // Added for Rust Temporals structure compatibility
    },
  };

  // Call setup data
  const setupData = Input_SetupData();

  // Filter out active heaters and rooms based on user activity
  const activeHeaters = electricHeaters.filter((heater) => activeDevices[heater.id]);
  const activeRooms = rooms.filter((room) => activeDevices[room.sensorId]);

  // Generate processes for heaters (includes topologies)
  const processesData =
    activeHeaters.length > 0 ? { processes: generateProcessesData(activeHeaters) } : {};

  // Generate nodes data for the rooms (including envelope and soil nodes)
  const nodesData = { nodes: generateNodesData(activeRooms) };

  // Generate node diffusions and time-series data
  const nodeDiffusionsData = generateNodeDiffusions(activeRooms, timestamps);

  // Generate other relevant datasets
  const marketData = generateMarketData();
  const groupsData = generateGroupsData(activeHeaters);
  const scenariosData = generateScenariosData();
  const riskData = generateRiskData();
  const genConstraintsData = generateGenConstraintsData(activeRooms);
  const bidSlotsData = generateBidSlotsData();

  // Prepare empty datasets for placeholders (reserve type, node delay, node histories, inflow blocks)
  const reserveType = { reserve_type: {} };
  const nodeDelay = { node_delay: [] }; // Correctly specifying it as an empty list
  const nodeHistories = { node_histories: {} };
  const inflowBlocks = { inflow_blocks: {} };

  // Combine everything into one final JSON object
  return {
    ...temporalsData,
    ...setupData,
    ...processesData, // Include the processes (heaters) data with topologies
    ...nodesData,
    ...nodeDiffusionsData,
    ...marketData,
    ...groupsData,
    ...scenariosData,
    ...riskData,
    ...genConstraintsData,
    ...bidSlotsData,
    ...reserveType,
    ...nodeDelay,
    ...nodeHistories,
    ...inflowBlocks,
  };
};

export default generateJsonContent;
