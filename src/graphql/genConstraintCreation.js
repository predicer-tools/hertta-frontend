// Utility for creating room generic constraints (up/down temperature setpoints)

import { print } from 'graphql/language/printer';
import {
  GRAPHQL_ENDPOINT,
  CREATE_GEN_CONSTRAINT_MUTATION,
} from '../graphql/queries';

/** Convert Celsius to Kelvin */
const CtoK = (c) => Number(c) + 273.15;

/** Low-level helper to call createGenConstraint */
async function createGenConstraint(input) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(CREATE_GEN_CONSTRAINT_MUTATION),
      variables: { constraint: input },
    }),
  });
  const json = await res.json();

  if (!res.ok) throw new Error(`Network error (${res.status})`);
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join(', '));

  const errs = json?.data?.createGenConstraint?.errors ?? [];
  if (errs.length) {
    const msg = errs.map(e => `${e.field}: ${e.message}`).join('; ');
    // Ignore "already exists" style errors to keep things idempotent
    if (!/exist|unique|already/i.test(msg)) throw new Error(msg);
  }
}

/**
 * Create the two constraints for a room:
 *  - c_<roomId>_air_up:    LESS_THAN,  isSetpoint=true, penalty=15, constant = maxTemp (K)
 *  - c_<roomId>_air_down:  GREATER_THAN,isSetpoint=true, penalty=15, constant = minTemp (K)
 *
 * @param {{ roomId: string, maxTemp: number|string, minTemp: number|string }} room
 */
export async function createRoomGenConstraints(room) {
  const { roomId, maxTemp, minTemp } = room;
  if (!roomId || maxTemp === undefined || minTemp === undefined) {
    throw new Error('createRoomGenConstraints requires roomId, maxTemp, minTemp');
  }

  const upInput = {
    name: `c_${roomId}_air_up`,
    gcType: 'LESS_THAN',
    isSetpoint: true,
    penalty: 15,
    constant: [{ constant: CtoK(maxTemp) }],
  };

  const downInput = {
    name: `c_${roomId}_air_down`,
    gcType: 'GREATER_THAN',
    isSetpoint: true,
    penalty: 15,
    constant: [{ constant: CtoK(minTemp) }],
  };

  // Create both; fail hard only on non-idempotent errors
  await createGenConstraint(upInput);
  await createGenConstraint(downInput);
}
