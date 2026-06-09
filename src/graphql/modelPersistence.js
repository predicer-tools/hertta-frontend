import { print } from 'graphql/language/printer';
import { GRAPHQL_ENDPOINT, SAVE_MODEL_MUTATION } from './queries';

export async function saveModelOnServer() {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(SAVE_MODEL_MUTATION),
      variables: {},
    }),
  });
  const result = await response.json();

  if (!response.ok) throw new Error(`Network error saving model (${response.status})`);
  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join(', '));
  }

  const message = result.data?.saveModel?.message;
  if (message) throw new Error(message);
}
