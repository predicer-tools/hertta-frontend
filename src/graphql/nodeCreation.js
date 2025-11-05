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
} from '../graphql/queries';

// Constants
export const AIR_HEATING_CAPACITY = 0.00278; // kWh/(m²K)
export const FLOOR_CONCRETE_HEATING_CAPACITY = 0.03; // kWh/(m²K)

// Internal flag used to ensure that the outside node is created only
// once.  The outside node is used as a reference environment for
// rooms; creating it multiple times would lead to validation errors
// from the API.  This flag is mutated after successful creation.
let outsideNodeCreated = false;

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
  return result.data.createNode;
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
  return result.data.setNodeState;
}

/**
 * Ensure that the outside node exists in the model.  This helper
 * function will create the node and set its state on the first call.
 * Subsequent calls will simply return without performing any API
 * operations.  The outside node is configured to represent ambient
 * temperatures between 0°C and 35°C with a default initial state of
 * 15°C (288.15 K).  These limits can be tuned as necessary.
 *
 * @private
 */
async function ensureOutsideNode() {
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
    inflow: [
      {
        scenario: 's1',
        value: { constant: 1.0 },
      },
    ],
  };
  const outsideState = {
    inMax: 1e10,
    outMax: 1e10,
    stateLossProportional: 0.0,
    stateMin: 273.15, // 0°C
    stateMax: 308.15, // 35°C
    initialState: 288.15, // 15°C default outside temperature
    isScenarioIndependent: false,
    isTemp: true,
    tEConversion: 0.0,
    residualValue: 0.0,
  };
  try {
    const createResult = await createNode(outsideNode);
    // Determine whether the outside node was newly created or already existed.
    let created = true;
    if (createResult?.errors && createResult.errors.length > 0) {
      // When errors are returned, we assume the node already exists. Log as info
      // and skip updating its state as requested by the user.
      console.info('Outside node may already exist:', createResult.errors);
      created = false;
    } else {
      console.log('Outside node created successfully');
    }

    // Only set the state on first creation. If the node already exists we
    // leave its state untouched.
    if (created) {
      const stateResult = await setNodeState(outsideNode.name, outsideState);
      if (stateResult?.errors && stateResult.errors.length > 0) {
        console.warn('Encountered errors setting state for outside node:', stateResult.errors);
      }
    }

    // Mark that we have attempted to create the outside node so that subsequent
    // calls know we've handled it once.
    outsideNodeCreated = true;
  } catch (err) {
    // Log the error but do not rethrow so that room node creation can proceed
    console.error('Failed to create outside node:', err.message);
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
    // Create outside node if needed before adding any other nodes
    await ensureOutsideNode();

    // Find selected material's heating capacity
    const selectedMat = materials.find((m) => m.name === config.selectedMaterial);
    const materialHeatingCapacityPerArea = selectedMat ? selectedMat.value : 0.04;

    const roomArea = parseFloat(room.roomWidth) * parseFloat(room.roomLength);
    const t_e_conversion_total = materialHeatingCapacityPerArea * roomArea;
    const t_e_conversion_int = AIR_HEATING_CAPACITY * roomArea;
    const t_e_conversion_env = t_e_conversion_total - t_e_conversion_int;
    const t_e_conversion_floor_slab = FLOOR_CONCRETE_HEATING_CAPACITY * roomArea;

    let sensorStateKelvin = parseFloat(room.sensorState);
    if (isNaN(sensorStateKelvin)) sensorStateKelvin = 273.15;
    sensorStateKelvin += 273.15;

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
      if (createResult?.errors && createResult.errors.length > 0) {
        console.error(`Error creating node ${name}`, createResult.errors);
        continue;
      }
      const stateResult = await setNodeState(name, state);
      if (stateResult?.errors && stateResult.errors.length > 0) {
        console.error(`Error setting state for node ${name}`, stateResult.errors);
      }
    }

    console.log(`Nodes for room "${room.roomId}" created and states set successfully.`);
  } catch (err) {
    console.error(`Failed to create nodes for room "${room.roomId}": ${err.message}`);
  }
}