import React from 'react';
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

function InputDataCreator({ setJsonContent, electricHeaters, interiorAirSensors, activeDevices }) {
  const handleGenerateJSON = () => {
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
        ts_format: "" // Added for Rust Temporals structure compatibility
      }
    };

    const setupData = Input_SetupData();
    const activeHeaters = electricHeaters.filter(heater => activeDevices[heater.id]);
    const activeSensors = interiorAirSensors.filter(sensor => activeDevices[sensor.sensorId]);
    const processesData = activeHeaters.length > 0 ? { processes: generateProcessesData(activeHeaters) } : {};
    const nodesData = { nodes: generateNodesData(activeSensors) };
    const nodeDiffusionsData = generateNodeDiffusions(activeSensors, timestamps);
    const marketData = generateMarketData();
    const groupsData = generateGroupsData(activeHeaters);
    const scenariosData = generateScenariosData();
    const riskData = generateRiskData();
    const genConstraintsData = generateGenConstraintsData(activeSensors);
    const bidSlotsData = generateBidSlotsData();

    const reserveType = { reserve_type: {} };
    const nodeDelay = { node_delay: [] }; // Correctly specifying it as an empty list
    const nodeHistories = { node_histories: {} };
    const inflowBlocks = { inflow_blocks: {} };

    const combinedData = {
      ...temporalsData,
      ...setupData,
      ...processesData,
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
      ...inflowBlocks
    };

    console.log(JSON.stringify(combinedData, null, 2)); // Log the generated JSON to debug
    setJsonContent(combinedData); // Set the JSON object instead of stringified JSON
  };

  return (
    <div>
      <h1>JSON Generator</h1>
      <button onClick={handleGenerateJSON}>Generate JSON</button>
    </div>
  );
}

export default InputDataCreator;
