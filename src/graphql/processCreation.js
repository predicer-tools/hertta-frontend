// src/graphql/processCreation.js
//
// Create a heater process AND attach its topologies via GraphQL.
// Requires an explicit roomName so we don't guess wrong.

import { print } from 'graphql/language/printer';
import {
  GRAPHQL_ENDPOINT,
  CREATE_PROCESS_MUTATION,
  CREATE_TOPOLOGY_MUTATION,
  UPDATE_TOPOLOGY_MUTATION,
  DELETE_TOPOLOGY_MUTATION,
  GET_NODE_QUERY,
    ADD_PROCESS_TO_GROUP_MUTATION,
} from './queries';

async function graphqlMutation(query, variables, resultField) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: print(query), variables }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join(', '));
  return result.data?.[resultField];
}

/**
 * Create a heater process and attach two topologies:
 *   1) electricitygrid -> <process>
 *   2) <process> -> <roomName>_air  (e.g., "Olohuone_air")
 *
 * Preconditions:
 *   - Node "<roomName>_air" must already exist; otherwise we throw and do NOT create the process.
 *
 * @param {Object} heater  - Must have `id`; may have `capacity` (number).
 * @param {string} roomName - The human-readable room name (e.g., "Olohuone").
 * @returns {Promise<{processResult: any, topologyErrors: Array}>}
 */
export async function createHeaterProcess(heater, roomName) {
  if (!heater || !heater.id) {
    throw new Error('createHeaterProcess requires a heater with id');
  }
  if (typeof roomName !== 'string' || !roomName.trim()) {
    throw new Error('createHeaterProcess requires a non-empty roomName');
  }

  const capacity = typeof heater.capacity === 'number' ? heater.capacity : 7;

  // Build "<roomName>_air" sink node (normalize spaces to underscores)
  const roomAirNode = `${roomName.trim().replace(/\s+/g, '_')}_air`;

  // ---- PRECHECK: verify that <roomName>_air node exists ----
  {
    const checkRes = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(GET_NODE_QUERY),
        variables: { name: roomAirNode },
      }),
    });
    const checkJson = await checkRes.json();

    if (checkJson.errors && checkJson.errors.length) {
      const msg = checkJson.errors.map((e) => e.message).join(', ');
      throw new Error(`Room air node "${roomAirNode}" not found: ${msg}`);
    }
    if (!checkJson?.data?.node?.name) {
      throw new Error(`Room air node "${roomAirNode}" not found`);
    }
  }

  // ---- 1) Create the process ----
  const processInput = {
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

  const createProcRes = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(CREATE_PROCESS_MUTATION),
      variables: { process: processInput },
    }),
  });
  const createProcJson = await createProcRes.json();
  const processResult = createProcJson?.data?.createProcess;
  const procErrors = processResult?.errors ?? [];
  if (procErrors.length) {
    const msg = procErrors.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`createProcess failed: ${msg}`);
  }

  // Add the process to process group 'p1'
  await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(ADD_PROCESS_TO_GROUP_MUTATION),
      variables: {
        processName: heater.id,
        groupName: 'p1',
      },
    }),
  });

  // ---- 2) Attach topologies ----
  const topologyInput = {
    capacity,
    vomCost: 0,
    rampUp: 1,
    rampDown: 1,
    initialLoad: 0.7,
    initialFlow: 0.7,
    capTs: [],
  };

  const topologyErrors = [];

  // 2a) electricitygrid -> process
  {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(CREATE_TOPOLOGY_MUTATION),
        variables: {
          topology: topologyInput,
          processName: heater.id,
          sourceNodeName: 'electricitygrid',
          sinkNodeName: null,
        },
      }),
    });
    const json = await res.json();
    const errs = json?.data?.createTopology?.errors ?? [];
    if (errs.length) topologyErrors.push({ direction: 'electricitygrid->process', errors: errs });
  }

  // 2b) process -> <roomName>_air
  {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(CREATE_TOPOLOGY_MUTATION),
        variables: {
          topology: topologyInput,
          processName: heater.id,
          sourceNodeName: null,
          sinkNodeName: roomAirNode,
        },
      }),
    });
    const json = await res.json();
    const errs = json?.data?.createTopology?.errors ?? [];
    if (errs.length) topologyErrors.push({ direction: `process->${roomAirNode}`, errors: errs });
  }

  return { processResult, topologyErrors };
}

export async function updateHeaterProcess(existingHeater, updatedHeater) {
  const processName = existingHeater.id;
  const oldRoomNode = `${existingHeater.roomId.trim().replace(/\s+/g, '_')}_air`;
  const newRoomNode = `${updatedHeater.roomId.trim().replace(/\s+/g, '_')}_air`;
  const capacity = updatedHeater.isEnabled === false ? 0 : updatedHeater.capacity;

  const updateTopology = async (sourceNodeName, sinkNodeName) => {
    const result = await graphqlMutation(
      UPDATE_TOPOLOGY_MUTATION,
      {
        topology: { capacity },
        processName,
        sourceNodeName,
        sinkNodeName,
      },
      'updateTopology'
    );
    const errors = result?.errors ?? [];
    if (errors.length) {
      throw new Error(errors.map((error) => `${error.field}: ${error.message}`).join('; '));
    }
  };

  await updateTopology('electricitygrid', null);

  if (oldRoomNode === newRoomNode) {
    await updateTopology(null, newRoomNode);
    return;
  }

  const deleteResult = await graphqlMutation(
    DELETE_TOPOLOGY_MUTATION,
    { processName, sourceNodeName: null, sinkNodeName: oldRoomNode },
    'deleteTopology'
  );
  if (deleteResult?.message) throw new Error(deleteResult.message);

  const topology = {
    capacity,
    vomCost: 0,
    rampUp: 1,
    rampDown: 1,
    initialLoad: 0.7,
    initialFlow: 0.7,
    capTs: [],
  };
  const createResult = await graphqlMutation(
    CREATE_TOPOLOGY_MUTATION,
    { topology, processName, sourceNodeName: null, sinkNodeName: newRoomNode },
    'createTopology'
  );
  const errors = createResult?.errors ?? [];
  if (errors.length) {
    throw new Error(errors.map((error) => `${error.field}: ${error.message}`).join('; '));
  }
}
