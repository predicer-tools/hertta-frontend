import { print } from 'graphql/language/printer';
import {
  ADD_PROCESS_TO_GROUP_MUTATION,
  CREATE_FLOW_CON_FACTOR_MUTATION,
  CREATE_GEN_CONSTRAINT_MUTATION,
  CREATE_PROCESS_MUTATION,
  CREATE_TOPOLOGY_MUTATION,
  GET_NODE_QUERY,
  GRAPHQL_ENDPOINT,
  MODEL_QUERY,
  UPDATE_TOPOLOGY_MUTATION,
} from './queries';

async function graphqlRequest(query, variables, resultField) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: print(query), variables }),
  });
  const result = await response.json();

  if (!response.ok) throw new Error(`Network error (${response.status})`);
  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join(', '));
  }

  const value = result.data?.[resultField];
  const errors = value?.errors ?? [];
  if (errors.length) {
    throw new Error(errors.map((error) => `${error.field}: ${error.message}`).join('; '));
  }
  return value;
}

async function requireNode(nodeName) {
  const node = await graphqlRequest(GET_NODE_QUERY, { name: nodeName }, 'node');
  if (!node?.name) throw new Error(`Required node "${nodeName}" does not exist`);
}

async function getScenarioNames() {
  const model = await graphqlRequest(MODEL_QUERY, {}, 'model');
  const scenarios = model?.inputData?.scenarios ?? [];
  return scenarios.length ? scenarios.map((scenario) => scenario.name) : ['s1'];
}

function processInput(name, conversion, efficiency) {
  return {
    name,
    conversion,
    isCfFix: false,
    isOnline: false,
    isRes: false,
    eff: efficiency,
    loadMin: 0,
    loadMax: 1,
    startCost: 0,
    minOnline: 0,
    maxOnline: 0,
    minOffline: 0,
    maxOffline: 0,
    initialState: true,
    isScenarioIndependent: false,
    cf: [],
    effTs: [],
    effOpsFun: [],
  };
}

async function createProcess(name, conversion, efficiency) {
  await graphqlRequest(
    CREATE_PROCESS_MUTATION,
    { process: processInput(name, conversion, efficiency) },
    'createProcess'
  );
  await graphqlRequest(
    ADD_PROCESS_TO_GROUP_MUTATION,
    { processName: name, groupName: 'p1' },
    'addProcessToGroup'
  );
}

async function createTopology(processName, sourceNodeName, sinkNodeName, capacity) {
  await graphqlRequest(
    CREATE_TOPOLOGY_MUTATION,
    {
      processName,
      sourceNodeName,
      sinkNodeName,
      topology: {
        capacity,
        vomCost: 0,
        rampUp: 1,
        rampDown: 1,
        initialLoad: 0,
        initialFlow: 0,
        capTs: [],
      },
    },
    'createTopology'
  );
}

async function createConstraint(name, gcType, constant, scenarios) {
  await graphqlRequest(
    CREATE_GEN_CONSTRAINT_MUTATION,
    {
      constraint: {
        name,
        gcType,
        isSetpoint: false,
        penalty: 0,
        constant: scenarios.map((scenario) => ({ scenario, constant })),
      },
    },
    'createGenConstraint'
  );
}

async function createFlowFactor(constraintName, processName, nodeName, value, scenarios) {
  await graphqlRequest(
    CREATE_FLOW_CON_FACTOR_MUTATION,
    {
      constraintName,
      processName,
      sourceOrSinkNodeName: nodeName,
      factor: scenarios.map((scenario) => ({ scenario, constant: value })),
    },
    'createFlowConFactor'
  );
}

/**
 * Creates the Hertta model parts for an air-source heat pump.
 *
 * Heating is a normal electricity-to-room-air UNIT process. Cooling is a
 * UNIT process that consumes electricity and removes room heat, then rejects
 * their combined energy outside. A COP constraint fixes the input ratio.
 */
export async function createAirSourceHeatPumpModel(heatPump) {
  const electricalCapacity = Number(heatPump?.electricalCapacity);
  const heatingCop = Number(heatPump?.heatingCop);
  const coolingCop = Number(heatPump?.coolingCop);

  if (!heatPump?.id || !heatPump?.roomId) {
    throw new Error('Air-source heat pump requires id and roomId');
  }
  if (electricalCapacity <= 0 || heatingCop <= 0 || coolingCop <= 0) {
    throw new Error('Air-source heat pump capacity and COP values must be greater than 0');
  }

  const roomAirNode = `${heatPump.roomId.trim().replace(/\s+/g, '_')}_air`;
  const heatingProcess = `${heatPump.id}_heating`;
  const coolingProcess = `${heatPump.id}_cooling`;
  const coolingCopConstraint = `c_${heatPump.id}_cooling_cop`;
  const compressorCapacityConstraint = `c_${heatPump.id}_compressor_capacity`;
  const scenarios = await getScenarioNames();

  await Promise.all([
    requireNode('electricitygrid'),
    requireNode('outside'),
    requireNode(roomAirNode),
  ]);

  await createProcess(heatingProcess, 'UNIT', heatingCop);
  await createTopology(heatingProcess, 'electricitygrid', null, electricalCapacity);
  await createTopology(heatingProcess, null, roomAirNode, electricalCapacity * heatingCop);

  await createProcess(coolingProcess, 'UNIT', 1);
  await createTopology(coolingProcess, 'electricitygrid', null, electricalCapacity);
  await createTopology(coolingProcess, roomAirNode, null, electricalCapacity * coolingCop);
  await createTopology(
    coolingProcess,
    null,
    'outside',
    electricalCapacity * (coolingCop + 1)
  );

  // cooling heat flow - cooling COP * cooling electricity flow = 0
  await createConstraint(coolingCopConstraint, 'EQUAL', 0, scenarios);
  await createFlowFactor(coolingCopConstraint, coolingProcess, roomAirNode, 1, scenarios);
  await createFlowFactor(
    coolingCopConstraint,
    coolingProcess,
    'electricitygrid',
    -coolingCop,
    scenarios
  );

  // heating electricity + cooling electricity <= compressor electrical capacity
  await createConstraint(
    compressorCapacityConstraint,
    'LESS_THAN',
    -electricalCapacity,
    scenarios
  );
  await createFlowFactor(
    compressorCapacityConstraint,
    heatingProcess,
    'electricitygrid',
    1,
    scenarios
  );
  await createFlowFactor(
    compressorCapacityConstraint,
    coolingProcess,
    'electricitygrid',
    1,
    scenarios
  );

  return {
    processes: [heatingProcess, coolingProcess],
    constraints: [coolingCopConstraint, compressorCapacityConstraint],
  };
}

export async function updateAirSourceHeatPumpEnabled(heatPump, isEnabled) {
  const electricalCapacity = isEnabled ? Number(heatPump.electricalCapacity) : 0;
  const heatingCapacity = isEnabled
    ? Number(heatPump.electricalCapacity) * Number(heatPump.heatingCop)
    : 0;
  const coolingCapacity = isEnabled
    ? Number(heatPump.electricalCapacity) * Number(heatPump.coolingCop)
    : 0;
  const coolingRejectCapacity = isEnabled
    ? Number(heatPump.electricalCapacity) * (Number(heatPump.coolingCop) + 1)
    : 0;
  const roomAirNode = `${heatPump.roomId.trim().replace(/\s+/g, '_')}_air`;

  const updateTopology = (processName, sourceNodeName, sinkNodeName, capacity) =>
    graphqlRequest(
      UPDATE_TOPOLOGY_MUTATION,
      {
        processName,
        sourceNodeName,
        sinkNodeName,
        topology: { capacity },
      },
      'updateTopology'
    );

  await Promise.all([
    updateTopology(`${heatPump.id}_heating`, 'electricitygrid', null, electricalCapacity),
    updateTopology(`${heatPump.id}_heating`, null, roomAirNode, heatingCapacity),
    updateTopology(`${heatPump.id}_cooling`, 'electricitygrid', null, electricalCapacity),
    updateTopology(`${heatPump.id}_cooling`, roomAirNode, null, coolingCapacity),
    updateTopology(`${heatPump.id}_cooling`, null, 'outside', coolingRejectCapacity),
  ]);
}
