// src/graphql/nodeDiffusionCreation.js

import {
  GRAPHQL_ENDPOINT,
  CREATE_NODE_DIFFUSION_MUTATION,
  DELETE_NODE_DIFFUSION_MUTATION,
} from './queries';
import { print } from 'graphql/language/printer';

// Constants for diffusion calculations
const frac_windows = 0.1;
const hight_wall = 3.0; // Height of walls in meters
const cond_env_int = 0.04; // Internal environmental conduction coefficient
const cond_windows = 0.8; // Conduction coefficient for windows
const cond_wall_ext_env = 0.001; // External wall to environment conduction
const cond_ceil_ext_env = 0.001; // External ceiling to environment conduction
const cond_soil_env = 0.001; // Soil to environment conduction

/**
 * Creates a node diffusion between two nodes with the given coefficient.
 * @param {string} fromNode - The name of the source node.
 * @param {string} toNode - The name of the target node.
 * @param {number} coefficient - The diffusion coefficient.
 */
async function createNodeDiffusion(fromNode, toNode, coefficient) {
  try {
    // Wrap the coefficient in the required ValueInput array format
    const variables = {
      newDiffusion: {
        fromNode,
        toNode,
        coefficient: [{ constant: coefficient }],
      },
    };

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Convert the mutation DocumentNode to a string with print()
        query: print(CREATE_NODE_DIFFUSION_MUTATION),
        variables,
      }),
    });
    const result = await response.json();

    if (!response.ok) throw new Error(`Network error (${response.status})`);
    if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join(', '));

    if (result.data.createNodeDiffusion.errors.length > 0) {
      const errorMessages = result.data.createNodeDiffusion.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join(', ');
      if (!/exist|unique|already/i.test(errorMessages)) {
        throw new Error(errorMessages);
      }
    }

    console.log(`Node diffusion created: ${fromNode} -> ${toNode}, coefficient: ${coefficient}`);
  } catch (error) {
    throw new Error(`Could not create diffusion ${fromNode} -> ${toNode}: ${error.message}`);
  }
}

async function deleteNodeDiffusion(fromNode, toNode) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(DELETE_NODE_DIFFUSION_MUTATION),
      variables: { fromNode, toNode },
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join(', '));

  const message = result.data?.deleteNodeDiffusion?.message;
  if (message && message !== 'no such node diffusion') {
    throw new Error(message);
  }
}

/**
 * Creates diffusions for a given room.
 * Diffusion directions:
 * - outside -> building_envelope
 * - building_envelope -> room_air
 * - building_envelope -> soil
 * @param {Object} room - The room object containing necessary properties.
 * @param {string} outsideNodeName - The name of the outside node (default: "outside").
 * @param {string} soilNodeName - The name of the soil node (default: "soil").
 */
export async function createRoomNodeDiffusions(room, outsideNodeName = 'outside', soilNodeName = 'soil') {
  const { roomId, roomWidth, roomLength } = room;

  const width = parseFloat(roomWidth);
  const length = parseFloat(roomLength);

  if (isNaN(width) || isNaN(length)) {
    throw new Error(`Invalid room dimensions for room "${roomId}"`);
  }

  const surf_area_walls_total = 2 * hight_wall * (width + length);
  const surf_area_walls = surf_area_walls_total * (1.0 - frac_windows);
  const surf_area_windows = surf_area_walls_total * frac_windows;
  const surf_area_floor = width * length;
  const surf_area_ceiling = surf_area_floor; // Ceiling area equals floor area

  // Calculate diffusion coefficients
  const diff_ext_env =
    surf_area_walls * cond_wall_ext_env +
    surf_area_windows * cond_windows +
    surf_area_ceiling * cond_ceil_ext_env;

  const diff_env_int =
    surf_area_walls * cond_env_int +
    surf_area_windows * cond_windows +
    surf_area_floor * cond_env_int +
    surf_area_ceiling * cond_env_int;

  const diff_soil_env = surf_area_floor * cond_soil_env;

  // Define node names
  const buildingEnvelopeNode = `${roomId}_envelope`;
  const roomAirNode = `${roomId}_air`;
  const roomSoilNode = `${roomId}_soil`;

  // Create diffusions
  try {
    // 1. outside -> building_envelope
    await createNodeDiffusion(outsideNodeName, buildingEnvelopeNode, diff_ext_env);

    // 2. building_envelope -> room_air
    await createNodeDiffusion(buildingEnvelopeNode, roomAirNode, diff_env_int);

    // 3. building_envelope -> soil
    await createNodeDiffusion(buildingEnvelopeNode, roomSoilNode, diff_soil_env);
  } catch (error) {
    throw new Error(`Could not create diffusions for room "${roomId}": ${error.message}`);
  }
}

export async function updateRoomNodeDiffusions(room, outsideNodeName = 'outside') {
  const buildingEnvelopeNode = `${room.roomId}_envelope`;
  const roomAirNode = `${room.roomId}_air`;
  const roomSoilNode = `${room.roomId}_soil`;

  await deleteNodeDiffusion(outsideNodeName, buildingEnvelopeNode);
  await deleteNodeDiffusion(buildingEnvelopeNode, roomAirNode);
  await deleteNodeDiffusion(buildingEnvelopeNode, roomSoilNode);
  await createRoomNodeDiffusions(room, outsideNodeName);
}
