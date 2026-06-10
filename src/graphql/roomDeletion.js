import { print } from 'graphql/language/printer';
import {
  DELETE_GEN_CONSTRAINT_MUTATION,
  DELETE_NODE_MUTATION,
  GRAPHQL_ENDPOINT,
} from './queries';

async function deleteModelPart(query, variables, resultField) {
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
  if (message && !/no such/i.test(message)) throw new Error(message);
}

export async function deleteRoomModel(roomId) {
  for (const constraintName of [`c_${roomId}_air_up`, `c_${roomId}_air_down`]) {
    await deleteModelPart(
      DELETE_GEN_CONSTRAINT_MUTATION,
      { name: constraintName },
      'deleteGenConstraint'
    );
  }

  for (const nodeName of [`${roomId}_air`, `${roomId}_envelope`, `${roomId}_soil`]) {
    await deleteModelPart(DELETE_NODE_MUTATION, { name: nodeName }, 'deleteNode');
  }
}
