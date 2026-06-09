// src/utils/genConstraints.js
import { print } from 'graphql/language/printer';
import {
  GRAPHQL_ENDPOINT,
  CREATE_GEN_CONSTRAINT_MUTATION,
  CREATE_STATE_CON_FACTOR_MUTATION,
  UPDATE_GEN_CONSTRAINT_MUTATION,
  UPDATE_STATE_CON_FACTOR_MUTATION,
  MODEL_QUERY, 
} from '../graphql/queries';

const CtoK = (c) => Number(c) + 273.15;

async function gql(query, variables) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: print(query), variables }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Network error (${res.status})`);
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join(', '));
  return json.data;
}

async function createGenConstraintSafe(input) {
  const data = await gql(CREATE_GEN_CONSTRAINT_MUTATION, { constraint: input });
  const errs = data?.createGenConstraint?.errors ?? [];
  if (errs.length) {
    const msg = errs.map(e => `${e.field}: ${e.message}`).join('; ');
    if (!/exist|unique|already/i.test(msg)) throw new Error(msg);
  }
}

async function addStateFactor(constraintName, nodeName, kelvin, scenarios) {
  const factor = scenarios.map((s) => ({ scenario: s, constant: kelvin }));
  const data = await gql(CREATE_STATE_CON_FACTOR_MUTATION, {
    constraintName,
    nodeName,
    factor,
  });
  const errs = data?.createStateConFactor?.errors ?? [];
  if (errs.length) {
    const msg = errs.map(e => `${e.field}: ${e.message}`).join('; ');
    if (!/exist|unique|already/i.test(msg)) throw new Error(msg);
  }
}

async function getScenarioNames() {
  const data = await gql(MODEL_QUERY, {});
  const scens = data?.model?.inputData?.scenarios ?? [];
  if (scens.length === 0) return ['s1']; 
  return scens.map(s => s.name);
}

/**
 * Create two setpoint constraints for a room and attach STATE factors:
 *  - c_<roomId>_air_up:    LESS_THAN,  isSetpoint=true, penalty=15, factor = state(<roomId>_air) == K(maxTemp)
 *  - c_<roomId>_air_down:  GREATER_THAN,isSetpoint=true, penalty=15, factor = state(<roomId>_air) == K(minTemp)
 */
export async function createRoomGenConstraints(room) {
  const { roomId, maxTemp, minTemp } = room;
  if (!roomId || maxTemp === undefined || minTemp === undefined) {
    throw new Error('createRoomGenConstraints requires roomId, maxTemp, minTemp');
  }

  const upName = `c_${roomId}_air_up`;
  const downName = `c_${roomId}_air_down`;
  const airNodeName = `${roomId}_air`;
  const scenarios = await getScenarioNames();

  await createGenConstraintSafe({
    name: upName,
    gcType: 'LESS_THAN',
    isSetpoint: true,
    penalty: 15,
    constant: [], 
  });

  await createGenConstraintSafe({
    name: downName,
    gcType: 'GREATER_THAN',
    isSetpoint: true,
    penalty: 15,
    constant: [],
  });

  await addStateFactor(upName, airNodeName, CtoK(maxTemp), scenarios);
  await addStateFactor(downName, airNodeName, CtoK(minTemp), scenarios);
}

export async function updateRoomGenConstraints(room) {
  const { roomId, maxTemp, minTemp } = room;
  const upName = `c_${roomId}_air_up`;
  const downName = `c_${roomId}_air_down`;
  const airNodeName = `${roomId}_air`;
  const scenarios = await getScenarioNames();

  for (const [name, gcType] of [[upName, 'LESS_THAN'], [downName, 'GREATER_THAN']]) {
    const data = await gql(UPDATE_GEN_CONSTRAINT_MUTATION, {
      name,
      constraint: { gcType, isSetpoint: true, penalty: 15 },
    });
    const errors = data?.updateGenConstraint?.errors ?? [];
    if (errors.length) throw new Error(errors.map((error) => `${error.field}: ${error.message}`).join('; '));
  }

  for (const [constraintName, temperature] of [[upName, maxTemp], [downName, minTemp]]) {
    const factor = scenarios.map((scenario) => ({ scenario, constant: CtoK(temperature) }));
    const data = await gql(UPDATE_STATE_CON_FACTOR_MUTATION, {
      constraintName,
      nodeName: airNodeName,
      factor,
    });
    const errors = data?.updateStateConFactor?.errors ?? [];
    if (errors.length) throw new Error(errors.map((error) => `${error.field}: ${error.message}`).join('; '));
  }
}
