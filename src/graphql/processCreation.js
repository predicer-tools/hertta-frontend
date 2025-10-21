// src/graphql/processCreation.js
//
// Utility functions for creating processes via the GraphQL API.  This
// module encapsulates the logic for assembling the input to the
// `createProcess` mutation and sending the request to the server.

import { print } from 'graphql/language/printer';
import { GRAPHQL_ENDPOINT, CREATE_PROCESS_MUTATION } from './queries';

/**
 * Create a process corresponding to an electric heater via the GraphQL API.
 *
 * Given a heater definition (as stored in the application state), this
 * helper will construct a `NewProcess` input object and execute the
 * `createProcess` mutation.  The efficiency (`eff`) is taken from
 * `heater.capacity`, reflecting the user provided value.  All other
 * required fields are set to sensible defaults as specified by the
 * Hertta schema.
 *
 * @param {Object} heater - The heater object (requires `id` and `capacity`).
 * @returns {Promise<Object>} The result of the createProcess mutation.
 */
export async function createHeaterProcess(heater) {
  if (!heater || !heater.id || heater.capacity === undefined) {
    throw new Error('createHeaterProcess requires a heater with id and capacity');
  }

  // Assemble the NewProcess input.  See the GraphQL schema for details on
  // each field.  We treat the heater ID as the process name and use
  // conversion type `UNIT` for a simple device.  Efficiency comes from
  // the heater's capacity (kW) which the user supplies via the form.
  const input = {
    name: heater.id,
    conversion: 'UNIT',
    isCfFix: false,
    isOnline: false,
    isRes: false,
    eff: 1.0,
    loadMin: 0.0,
    loadMax: 1.0,
    startCost: 0.0,
    minOnline: 0.0,
    maxOnline: 0.0,
    minOffline: 0.0,
    maxOffline: 0.0,
    initialState: true,
    isScenarioIndependent: false,
    cf: [],
    effTs: [],
    effOpsFun: [],
  };

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(CREATE_PROCESS_MUTATION),
        variables: { process: input },
      }),
    });
    const result = await response.json();
    return result.data?.createProcess;
  } catch (err) {
    console.error('Failed to create process:', err);
    throw err;
  }
}