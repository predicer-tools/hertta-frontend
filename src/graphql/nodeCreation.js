// src/utils/nodeCreation.js

/**
 * Utility functions for creating nodes via the GraphQL API.  This module
 * exposes helpers for creating thermal model nodes for a room (air,
 * envelope and soil).  In addition to the room specific nodes, an
 * "outside" node is created once when the first room is processed.  The
 * outside node represents the ambient environment that the building
 * exchanges heat with.  Subsequent calls to {@link createRoomNodes}
 * will skip the creation of the outside node once it has been added to
 * the model.  The outside node is created via the same GraphQL
 * interface used for other nodes, so it persists in the model and is
 * available for topology connections.
 */

import { print } from 'graphql/language/printer';
import {
  GRAPHQL_ENDPOINT,
  CREATE_NODE_MUTATION,
  SET_NODE_STATE_MUTATION,
  UPDATE_NODE_STATE_MUTATION,
  CONNECT_NODE_INFLOW_TO_TEMP_FORECAST,
} from '../graphql/queries';

// Constants
export const AIR_HEATING_CAPACITY = 0.00278; // kWh/(m²K)
export const FLOOR_CONCRETE_HEATING_CAPACITY = 0.03; // kWh/(m²K)

const isAlreadyExistsError = (errors = []) =>
  errors.length > 0 && errors.every((error) => /exist|unique|already/i.test(error.message));

/**
 * Create a single node using the GraphQL API.
 *
 * @param {Object} node - The node input matching the NewNode input type.
 * @returns {Promise<Object>} The result of the createNode mutation.
 */
export async function createNode(node) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(CREATE_NODE_MUTATION),
      variables: { node },
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join(', '));
  return result.data?.createNode;
}

/**
 * Set the state of an existing node via the GraphQL API.
 *
 * @param {String} nodeName - The name of the node for which to set state.
 * @param {Object|null} state - The NewState input.  Pass `null` to clear.
 * @returns {Promise<Object>} The result of the setNodeState mutation.
 */
export async function setNodeState(nodeName, state) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(SET_NODE_STATE_MUTATION),
      variables: { nodeName, state },
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join(', '));
  return result.data?.setNodeState;
}

async function updateNodeState(nodeName, state) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(UPDATE_NODE_STATE_MUTATION),
      variables: { nodeName, state },
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join(', '));

  const errors = result.data?.updateNodeState?.errors ?? [];
  if (errors.length) {
    throw new Error(errors.map((error) => `${error.field}: ${error.message}`).join('; '));
  }
}

export async function updateRoomNodeStates(room, config, materials) {
  const selectedMat = materials.find((material) => material.name === config.selectedMaterial);
  const materialHeatingCapacityPerArea = selectedMat ? selectedMat.value : 0.04;
  const roomArea = parseFloat(room.roomWidth) * parseFloat(room.roomLength);
  const sensorStateKelvin = Number.isFinite(parseFloat(room.sensorState))
    ? parseFloat(room.sensorState) + 273.15
    : 273.15;

  const sharedState = {
    initialState: sensorStateKelvin,
    isTemp: true,
  };

  await updateNodeState(`${room.roomId}_air`, {
    ...sharedState,
    stateMin: parseFloat(room.minTemp) + 273.15,
    stateMax: parseFloat(room.maxTemp) + 273.15,
    tEConversion: AIR_HEATING_CAPACITY * roomArea,
  });
  await updateNodeState(`${room.roomId}_envelope`, {
    ...sharedState,
    tEConversion: (materialHeatingCapacityPerArea * roomArea) - (AIR_HEATING_CAPACITY * roomArea),
  });
  await updateNodeState(`${room.roomId}_soil`, {
    ...sharedState,
    tEConversion: FLOOR_CONCRETE_HEATING_CAPACITY * roomArea,
  });
}

async function connectNodeInflowToFMI(nodeName) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(CONNECT_NODE_INFLOW_TO_TEMP_FORECAST),
      variables: {
        nodeName,
        forecastName: 'FMI',
        forecastType: 'temperature',
      },
    }),
  });
  const json = await response.json();

  if (!response.ok) throw new Error(`Network error (${response.status})`);
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join(', '));

  const maybe = json?.data?.connectNodeInflowToTemperatureForecast;
  if (maybe?.message) {
    // Backend uses MaybeError; a message here indicates a problem
    throw new Error(maybe.message);
  }
}

/**
 * Ensure that the outside node exists in the model.  This helper
 * function will create the node and set its state on the first call.
 * Subsequent calls will simply return without performing any API
 * operations.  The outside node is configured to represent ambient
 * temperatures between 0°C and 35°C with a default initial state of
 * 15°C (288.15 K).  These limits can be tuned as necessary.
 *
 *
 */
export async function ensureOutsideNode() {
  // Always attempt to create the outside node.  Even if it has already
  // been created by a previous call, the API will return a validation
  // error which we can safely ignore.  This approach ensures the
  // outside node exists without relying solely on client-side state.
  const outsideNode = {
    name: 'outside',
    isCommodity: false,
    isMarket: false,
    isRes: false,
    cost: [],
    inflow: [],
  };

  const outsideState = {
    inMax: 1e10,
    outMax: 1e10,
    stateLossProportional: 0.0,
    stateMin: 238.15,     
    stateMax: 308.15,     
    initialState: 288.15,
    isScenarioIndependent: false,
    isTemp: true,
    tEConversion: 1e9,
    residualValue: 0.0,
  };

  try {
    const createResult = await createNode(outsideNode);

    let created = true;
    if (createResult?.errors && createResult.errors.length > 0) {

      console.info('Outside node may already exist:', createResult.errors);
      created = false;
    } else {
      console.log('Outside node created successfully');
    }

    if (created) {
      const stateResult = await setNodeState(outsideNode.name, outsideState);
      if (stateResult?.errors && stateResult.errors.length > 0) {
        console.warn('Encountered errors setting state for outside node:', stateResult.errors);
      }
    }

    try {
      await connectNodeInflowToFMI('outside');
      console.log('Outside node inflow connected to FMI temperature forecast.');
    } catch (e) {
      console.warn('Could not connect outside inflow to FMI temperature forecast:', e.message);
    }

  } catch (err) {
    throw new Error(`Failed to ensure outside node: ${err.message}`);
  }
}

/**
 * Creates the room nodes (air, envelope and soil) and sets their states.
 * Before any room specific nodes are created, the outside node is ensured
 * to exist.  Each call will compute thermal conversion coefficients based
 * on the provided room dimensions and selected material, convert the
 * sensor reading and min/max temperatures to Kelvin, and then create
 * and initialise the corresponding nodes via GraphQL mutations.
 *
 * @param {Object} room - The room object with necessary fields (roomId,
 *   roomWidth, roomLength, maxTemp, minTemp, sensorState).
 * @param {Object} config - The configuration object from ConfigContext,
 *   which includes config.selectedMaterial.
 * @param {Array} materials - The array of materials.
 */
export async function createRoomNodes(room, config, materials) {
  try {
    await ensureOutsideNode();

    // Find selected material's heating capacity
    const selectedMat = materials.find((m) => m.name === config.selectedMaterial);
    const materialHeatingCapacityPerArea = selectedMat ? selectedMat.value : 0.04;

    const roomArea = parseFloat(room.roomWidth) * parseFloat(room.roomLength);
    const t_e_conversion_total = materialHeatingCapacityPerArea * roomArea;
    const t_e_conversion_int = AIR_HEATING_CAPACITY * roomArea;
    const t_e_conversion_env = t_e_conversion_total - t_e_conversion_int;
    const t_e_conversion_floor_slab = FLOOR_CONCRETE_HEATING_CAPACITY * roomArea;

    let sensorStateCelsius = parseFloat(room.sensorState);
    if (isNaN(sensorStateCelsius)) sensorStateCelsius = 0;
    const sensorStateKelvin = sensorStateCelsius + 273.15;

    const maxTempK = parseFloat(room.maxTemp) + 273.15;
    const minTempK = parseFloat(room.minTemp) + 273.15;

    // Define nodes
    const airNode = {
      name: `${room.roomId}_air`,
      isCommodity: false,
      isMarket: false,
      isRes: false,
      cost: [],
      inflow: [],
    };

    const envelopeNode = {
      name: `${room.roomId}_envelope`,
      isCommodity: false,
      isMarket: false,
      isRes: false,
      cost: [],
      inflow: [],
    };

    const soilNode = {
      name: `${room.roomId}_soil`,
      isCommodity: false,
      isMarket: false,
      isRes: false,
      cost: [],
      inflow: [],
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
      initialState: sensorStateKelvin,
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
      if (createResult?.errors && createResult.errors.length > 0) {
        if (!isAlreadyExistsError(createResult.errors)) {
          throw new Error(`Could not create node ${name}: ${createResult.errors
            .map((error) => `${error.field}: ${error.message}`)
            .join('; ')}`);
        }
      }
      const stateResult = await setNodeState(name, state);
      if (stateResult?.errors && stateResult.errors.length > 0) {
        throw new Error(`Could not set state for node ${name}: ${stateResult.errors
          .map((error) => `${error.field}: ${error.message}`)
          .join('; ')}`);
      }
    }

    console.log(`Nodes for room "${room.roomId}" created and states set successfully.`);
  } catch (err) {
    throw new Error(`Failed to create nodes for room "${room.roomId}": ${err.message}`);
  }
}
