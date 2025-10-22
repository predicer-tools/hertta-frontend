// src/graphql/configActions.js
// Central place for config-related GraphQL actions.

import { GRAPHQL_ENDPOINT } from './queries';

async function graphqlRequest(query, variables) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Network error (${res.status})`);
  }
  if (json.errors && json.errors.length) {
    throw new Error(json.errors.map((e) => e.message).join(', '));
  }
  return json.data;
}

/**
 * Ensure a node named "electricitygrid" exists with zero-ish values,
 * inflow referencing the forecast "ELERING", and state tEConversion = 1.
 *
 * Schema check:
 * - ForecastValueInput has optional fields (scenario, constant, series, forecast, fType).
 *   fType is NOT required, so it's omitted here.
 *   If your backend needs it, add: { forecast: 'ELERING', fType: 'temperature' } below.
 */
export async function ensureElectricityGridNode() {
  // 1) Create the node (ignore "already exists" errors)
  const nodeInput = {
    name: 'electricitygrid',
    isCommodity: false,
    isMarket: false,
    isRes: false,
    cost: [{ constant: 0 }],           // ValueInput[]
    // If required in your deployment, use:
    inflow: [{ forecast: 'ELERING', fType: 'electricity"' }],
  };

  const createNodeData = await graphqlRequest(
    `mutation ($node: NewNode!) {
      createNode(node: $node) {
        errors { field message }
      }
    }`,
    { node: nodeInput }
  );

  const nodeErrors = createNodeData?.createNode?.errors ?? [];
  if (nodeErrors.length) {
    const msg = nodeErrors.map((e) => `${e.field}: ${e.message}`).join('; ');
    const isAlreadyExists =
      /exist/i.test(msg) || /unique/i.test(msg) || /already/i.test(msg);
    if (!isAlreadyExists) {
      throw new Error(`createNode(electricitygrid) failed: ${msg}`);
    }
  }

  // 2) Set state: tEConversion = 1, everything else 0/false
  const stateInput = {
    inMax: 0,
    outMax: 0,
    stateLossProportional: 0,
    stateMin: 0,
    stateMax: 0,
    initialState: 0,
    isScenarioIndependent: false,
    isTemp: false,
    tEConversion: 1,
    residualValue: 0,
  };

  const setStateData = await graphqlRequest(
    `mutation ($state: NewState, $nodeName: String!) {
      setNodeState(state: $state, nodeName: $nodeName) {
        errors { field message }
      }
    }`,
    { state: stateInput, nodeName: 'electricitygrid' }
  );

  const stateErrors = setStateData?.setNodeState?.errors ?? [];
  if (stateErrors.length) {
    const msg = stateErrors.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`setNodeState(electricitygrid) failed: ${msg}`);
  }

  return true;
}

export async function createProcessGroup(name = 'p1') {
  const data = await graphqlRequest(
    `mutation ($name: String!) {
      createProcessGroup(name: $name) { message }
    }`,
    { name }
  );
  return data?.createProcessGroup?.message ?? null;
}

/**
 * Creates/updates InputDataSetup with the provided defaults:
 * - useMarketBids = true
 * - useReserves = true
 * - useReserveRealisation = true
 * - useNodeDummyVariables = true
 * - useRampDummyVariables = true
 * - nodeDummyVariableCost = 10000
 * - rampDummyVariableCost = 10000
 * - commonTimesteps = 0
 * - commonScenarioName = "ALL"
 */
export async function createDefaultInputDataSetup() {
  const setupUpdate = {
    useMarketBids: true,
    useReserves: true,
    useReserveRealisation: true,
    useNodeDummyVariables: true,
    useRampDummyVariables: true,
    nodeDummyVariableCost: 10000,
    rampDummyVariableCost: 10000,
    commonTimesteps: 0,
    commonScenarioName: 'ALL',
  };

  const data = await graphqlRequest(
    `mutation ($setupUpdate: InputDataSetupInput!) {
      createInputDataSetup(setupUpdate: $setupUpdate) {
        errors { field message }
      }
    }`,
    { setupUpdate }
  );

  const errs = data?.createInputDataSetup?.errors ?? [];
  if (errs.length) {
    const msg = errs.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`createInputDataSetup failed: ${msg}`);
  }
  return true;
}

/**
 * One-shot initializer:
 * 1) ensure electricitygrid node exists (with inflow "ELERING" + tEConversion=1)
 * 2) create process group "p1"
 * 3) create default InputDataSetup
 */
export async function applyDefaultModelSetup() {
  await ensureElectricityGridNode();
  const pgMsg = await createProcessGroup('p1');
  await createDefaultInputDataSetup();
  return { processGroupMessage: pgMsg || null };
}
