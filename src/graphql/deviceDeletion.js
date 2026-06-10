import { print } from 'graphql/language/printer';
import {
  DELETE_GEN_CONSTRAINT_MUTATION,
  DELETE_PROCESS_MUTATION,
  GRAPHQL_ENDPOINT,
} from './queries';

async function deleteModelPart(query, variables, resultField, { ignoreMissing = false } = {}) {
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

  const message = result.data?.[resultField]?.message;
  if (message && !(ignoreMissing && /no such/i.test(message))) {
    throw new Error(message);
  }
}

export async function deleteElectricHeaterModel(heaterId) {
  await deleteModelPart(DELETE_PROCESS_MUTATION, { name: heaterId }, 'deleteProcess');
}

export async function deleteAirSourceHeatPumpModel(heatPumpId) {
  const constraintNames = [
    `c_${heatPumpId}_cooling_cop`,
    `c_${heatPumpId}_compressor_capacity`,
  ];
  const processNames = [
    `${heatPumpId}_heating`,
    `${heatPumpId}_cooling`,
    `${heatPumpId}_cooling_power`,
  ];

  for (const constraintName of constraintNames) {
    await deleteModelPart(
      DELETE_GEN_CONSTRAINT_MUTATION,
      { name: constraintName },
      'deleteGenConstraint',
      { ignoreMissing: true }
    );
  }
  for (const processName of processNames) {
    await deleteModelPart(
      DELETE_PROCESS_MUTATION,
      { name: processName },
      'deleteProcess',
      { ignoreMissing: true }
    );
  }
}
