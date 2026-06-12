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

async function createProcess(name) {
  await graphqlRequest(
    CREATE_PROCESS_MUTATION,
    {
      process: {
        name,
        conversion: 'UNIT',
        isCfFix: false,
        isOnline: false,
        isRes: false,
        eff: 1,
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
      },
    },
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

async function createConstraint(name, scenarios) {
  await graphqlRequest(
    CREATE_GEN_CONSTRAINT_MUTATION,
    {
      constraint: {
        name,
        gcType: 'EQUAL',
        isSetpoint: false,
        penalty: 0,
        constant: scenarios.map((scenario) => ({ scenario, constant: 0 })),
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

export async function createCoolingDeviceModel(coolingDevice) {
  const electricalCapacity = Number(coolingDevice?.electricalCapacity);
  const coolingCop = Number(coolingDevice?.coolingCop);

  if (!coolingDevice?.id || !coolingDevice?.roomId) {
    throw new Error('Cooling device requires id and roomId');
  }
  if (electricalCapacity <= 0 || coolingCop <= 0) {
    throw new Error('Cooling device capacity and COP must be greater than 0');
  }

  const roomAirNode = `${coolingDevice.roomId.trim().replace(/\s+/g, '_')}_air`;
  const coolingProcess = `${coolingDevice.id}_cooling`;
  const coolingCopConstraint = `c_${coolingDevice.id}_cooling_cop`;
  const scenarios = await getScenarioNames();

  await Promise.all([
    requireNode('electricitygrid'),
    requireNode('outside'),
    requireNode(roomAirNode),
  ]);

  await createProcess(coolingProcess);
  await createTopology(coolingProcess, 'electricitygrid', null, electricalCapacity);
  await createTopology(coolingProcess, roomAirNode, null, electricalCapacity * coolingCop);
  await createTopology(
    coolingProcess,
    null,
    'outside',
    electricalCapacity * (coolingCop + 1)
  );

  await createConstraint(coolingCopConstraint, scenarios);
  await createFlowFactor(coolingCopConstraint, coolingProcess, roomAirNode, 1, scenarios);
  await createFlowFactor(
    coolingCopConstraint,
    coolingProcess,
    'electricitygrid',
    -coolingCop,
    scenarios
  );
}

export async function updateCoolingDeviceEnabled(coolingDevice, isEnabled) {
  const electricalCapacity = isEnabled ? Number(coolingDevice.electricalCapacity) : 0;
  const coolingCapacity = isEnabled
    ? Number(coolingDevice.electricalCapacity) * Number(coolingDevice.coolingCop)
    : 0;
  const exhaustCapacity = isEnabled
    ? Number(coolingDevice.electricalCapacity) * (Number(coolingDevice.coolingCop) + 1)
    : 0;
  const roomAirNode = `${coolingDevice.roomId.trim().replace(/\s+/g, '_')}_air`;
  const processName = `${coolingDevice.id}_cooling`;

  const updateTopology = (sourceNodeName, sinkNodeName, capacity) =>
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
    updateTopology('electricitygrid', null, electricalCapacity),
    updateTopology(roomAirNode, null, coolingCapacity),
    updateTopology(null, 'outside', exhaustCapacity),
  ]);
}
