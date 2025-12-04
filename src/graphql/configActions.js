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

  if (!res.ok) throw new Error(`Network error (${res.status})`);
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(', '));
  return json.data;
}

/**
 * Ensure Scenario exists (idempotent-ish).
 * If it already exists, the backend may return a message; treat "already exists" as OK.
 */
export async function ensureScenario(name = 's1', weight = 1) {
  const data = await graphqlRequest(
    `mutation ($name: String!, $weight: Float!) {
      createScenario(name: $name, weight: $weight) { message }
    }`,
    { name, weight }
  );
  const msg = data?.createScenario?.message || '';
  if (msg && !/exist|already/i.test(msg)) {
    throw new Error(`createScenario(${name}) failed: ${msg}`);
  }
  return true;
}

/**
 * Ensure a node named "electricitygrid" exists with zero-ish values,
 * inflow referencing the forecast "ELERING" (fType: "electricity"),
 * and state tEConversion = 1.
 */
export async function ensureElectricityGridNode() {
  const nodeInput = {
    name: 'electricitygrid',
    isCommodity: false,
    isMarket: false,
    isRes: false,
    cost: [],
    inflow: [],
  };

  const createNodeData = await graphqlRequest(
    `mutation ($node: NewNode!) {
      createNode(node: $node) { errors { field message } }
    }`,
    { node: nodeInput }
  );

  const nodeErrors = createNodeData?.createNode?.errors ?? [];
  if (nodeErrors.length) {
    const msg = nodeErrors.map((e) => `${e.field}: ${e.message}`).join('; ');
    const isAlreadyExists = /exist|unique|already/i.test(msg);
    if (!isAlreadyExists) throw new Error(`createNode(electricitygrid) failed: ${msg}`);
  }

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
      setNodeState(state: $state, nodeName: $nodeName) { errors { field message } }
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
 * Create/Update InputDataSetup with defaults.
 * NOTE: commonScenarioName must exist -> ensured via ensureScenario().
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
    commonScenarioName: 's1',
  };

  const data = await graphqlRequest(
    `mutation ($setupUpdate: InputDataSetupInput!) {
      createInputDataSetup(setupUpdate: $setupUpdate) { errors { field message } }
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
 * Create or update a risk parameter to a given value.
 * We delete first (ignore missing), then create with the desired value.
 */
export async function setRisk(parameter, value) {
  // Best-effort delete
  await graphqlRequest(
    `mutation ($parameter: String!) {
      deleteRisk(parameter: $parameter) { message }
    }`,
    { parameter }
  );

  // Create with new value
  const data = await graphqlRequest(
    `mutation ($risk: NewRisk!) {
      createRisk(risk: $risk) { errors { field message } }
    }`,
    { risk: { parameter, value } }
  );

  const errs = data?.createRisk?.errors ?? [];
  if (errs.length) {
    const msg = errs.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`createRisk(${parameter}) failed: ${msg}`);
  }
  return true;
}

/**
 * Create the NPE ENERGY market on electricitygrid using process group "p1".
 * Prices are tied to the ELERING electricity forecast.
 * Direction omitted (null).
 */
export async function createNPEnergyMarket() {
  const marketInput = {
    name: 'npe',
    mType: 'ENERGY',
    node: 'electricitygrid',
    processGroup: 'p1',
    realisation: [{ constant: 0 }],
    isBid: true,
    isLimited: false,
    minBid: 0,
    maxBid: 0,
    fee: 0,
    price: [{ forecast: 'ELERING', fType: 'electricity' }],
    upPrice: [],
    downPrice: [],
    reserveActivationPrice: [{ constant: 0 }],
  };

  const data = await graphqlRequest(
    `mutation ($market: NewMarket!) {
      createMarket(market: $market) { errors { field message } }
    }`,
    { market: marketInput }
  );

  const errs = data?.createMarket?.errors ?? [];
  if (errs.length) {
    const msg = errs.map((e) => `${e.field}: ${e.message}`).join('; ');
    const isAlreadyExists = /exist|unique|already/i.test(msg);
    if (!isAlreadyExists) throw new Error(`createMarket(npe) failed: ${msg}`);
  }
  return true;
}

/**
 * Set (or update) device location.
 * @param {{ country: string, place: string }} location
 */
export async function setLocation(location) {
  if (!location || !location.country || !location.place) {
    throw new Error('setLocation: location.country and location.place are required');
  }

  const mutation = `
    mutation UpdateSettings($settingsInput: SettingsInput!) {
      updateSettings(settingsInput: $settingsInput) {
        ... on ValidationErrors {
          errors { field message }
        }
        ... on Settings {
          location { country place }
        }
      }
    }
  `;

  const data = await graphqlRequest(mutation, {
    settingsInput: { location: { country: location.country, place: location.place } },
  });

  const result = data?.updateSettings;
  if (result?.errors?.length) {
    const msg = result.errors.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`updateSettings(location) failed: ${msg}`);
  }
  return result?.location ?? null;
}

/**
 * Set the model time line to:
 *  - duration: 12 hours
 *  - step: 1 hour
 *  - start: CURRENT_HOUR
 */
export async function setTimeline12hHourlyFromCurrentHour() {
  const mutation = `
    mutation UpdateTimeLine($timeLineInput: TimeLineUpdate!) {
      updateTimeLine(timeLineInput: $timeLineInput) {
        errors { field message }
      }
    }
  `;

  const timeLineInput = {
    duration: { hours: 12, minutes: 0, seconds: 0 },
    step: { hours: 1, minutes: 0, seconds: 0 },
    start: { clockChoice: 'CURRENT_HOUR' },
  };

  const data = await graphqlRequest(mutation, { timeLineInput });
  const errs = data?.updateTimeLine?.errors ?? [];
  if (errs.length) {
    const msg = errs.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`updateTimeLine failed: ${msg}`);
  }
  return true;
}

/**
 * One-shot initializer (idempotent-ish):
 * 1) ensure electricitygrid node exists (ELERING, fType 'electricity', tEConversion=1)
 * 2) ensure scenario "s1" (weight 1)
 * 3) create process group "p1"
 * 4) create default InputDataSetup (commonScenarioName: 's1')
 * 5) set risks: alfa=0.1, beta=0.0
 * 6) set device location (country/place) if provided
 * 7) create NPE energy market on electricitygrid with group "p1"
 * 8) set timeline to 12h duration, 1h step, starting at CURRENT_HOUR
 */
export async function applyDefaultModelSetup(userLocation /* { country, place } */) {
  await ensureElectricityGridNode();
  await ensureScenario('s1', 1);
  const pgMsg = await createProcessGroup('p1');
  await createDefaultInputDataSetup();

  await setRisk('alfa', 0.1);
  await setRisk('beta', 0.0);

  if (userLocation?.country && userLocation?.place) {
    await setLocation(userLocation);
  }

  await createNPEnergyMarket();

  // Timeline setup (12h horizon, 1h step, start at CURRENT_HOUR)
  await setTimeline12hHourlyFromCurrentHour();

  return { processGroupMessage: pgMsg || null };
}
