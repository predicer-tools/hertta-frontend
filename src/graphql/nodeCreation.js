// src/utils/nodeCreation.js

import { GRAPHQL_ENDPOINT, CREATE_NODE_MUTATION, SET_NODE_STATE_MUTATION } from '../graphql/queries';

// Constants
export const AIR_HEATING_CAPACITY = 0.00278; // kWh/(m²K)
export const FLOOR_CONCRETE_HEATING_CAPACITY = 0.03; // kWh/(m²K)

// Helper functions for GraphQL calls
export async function createNode(node) {
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
}

export async function setNodeState(nodeName, state) {
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
}

/**
 * Creates the room nodes and sets their states.
 * @param {Object} room - The room object with necessary fields (roomId, roomWidth, roomLength, maxTemp, minTemp, sensorState).
 * @param {Object} config - The configuration object from ConfigContext, which includes config.selectedMaterial.
 * @param {Array} materials - The array of materials.
 */
export async function createRoomNodes(room, config, materials) {
  try {
    // Find selected material's heating capacity
    const selectedMat = materials.find(m => m.name === config.selectedMaterial);
    const materialHeatingCapacityPerArea = selectedMat ? selectedMat.value : 0.04;

    const roomArea = parseFloat(room.roomWidth) * parseFloat(room.roomLength);
    const t_e_conversion_total = materialHeatingCapacityPerArea * roomArea;
    const t_e_conversion_int = AIR_HEATING_CAPACITY * roomArea;
    const t_e_conversion_env = t_e_conversion_total - t_e_conversion_int;
    const t_e_conversion_floor_slab = FLOOR_CONCRETE_HEATING_CAPACITY * roomArea;

    let sensorStateKelvin = parseFloat(room.sensorState);
    if (isNaN(sensorStateKelvin)) sensorStateKelvin = 0.0;
    sensorStateKelvin += 273.15;

    const maxTempK = parseFloat(room.maxTemp) + 273.15;
    const minTempK = parseFloat(room.minTemp) + 273.15;

    // Define nodes
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
      initialState: 277.15,
      isScenarioIndependent: false,
      isTemp: true,
      tEConversion: t_e_conversion_floor_slab,
      residualValue: 0.0,
    };

    // Create and set states for the three nodes
    const nodesToCreate = [
      { node: airNode, state: airState, name: `${room.roomId}_air` },
      { node: envelopeNode, state: envelopeState, name: `${room.roomId}_envelope` },
      { node: soilNode, state: soilState, name: `${room.roomId}_soil` },
    ];

    for (const { node, state, name } of nodesToCreate) {
      const createResult = await createNode(node);
      if (createResult.errors && createResult.errors.length > 0) {
        console.error(`Error creating node ${name}`, createResult.errors);
        return;
      }
      const stateResult = await setNodeState(name, state);
      if (stateResult.errors && stateResult.errors.length > 0) {
        console.error(`Error setting state for node ${name}`, stateResult.errors);
        return;
      }
    }

    console.log(`Nodes for room "${room.roomId}" created and states set successfully.`);
  } catch (err) {
    console.error(`Failed to create nodes for room "${room.roomId}": ${err.message}`);
  }
}
