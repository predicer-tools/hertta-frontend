// src/pages/ModelPage.js

/*
 * A React component that displays the current optimisation model stored
 * in the GraphQL backend.  The model is fetched via a GraphQL query
 * on component mount and can be refreshed or saved via buttons.  When
 * using the Apollo gql tag, the exported queries are DocumentNode
 * objects, so we must print them to strings before sending them
 * through fetch.  Without converting them, the backend rejects the
 * request with "Request body is not valid JSON" because it sees
 * `[object Object]` instead of the actual query string.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { print } from 'graphql/language/printer';
import { GRAPHQL_ENDPOINT } from '../graphql/queries';
// We still import SAVE_MODEL_MUTATION so that the save button can persist
// the current model; however, we no longer import GET_MODEL_QUERY because
// we use a custom query that only fetches nodes.
import { SAVE_MODEL_MUTATION } from '../graphql/queries';

// Define a minimal query that only fetches the names of nodes from the
// model.  Using a plain string here avoids the need to call print() on
// a DocumentNode and keeps the payload small.
const GET_NODE_NAMES_QUERY = `
  query {
    model {
      inputData {
        nodes {
          name
        }
      }
    }
  }
`;

const ModelPage = () => {
  // We only track nodes instead of the entire model.  Each node is an
  // object with at least a `name` property.
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Helper to fetch the model via GraphQL.  We print the query
  // DocumentNode to a string before sending it as JSON.
  const fetchModel = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send our custom query as a plain string.  No need to call print()
        // because GET_NODE_NAMES_QUERY is already a string.
        body: JSON.stringify({ query: GET_NODE_NAMES_QUERY }),
      });
      const result = await response.json();
      if (result.errors) {
        setError(result.errors.map(e => e.message).join(', '));
      } else {
        const fetchedNodes =
          result?.data?.model?.inputData?.nodes || [];
        setNodes(fetchedNodes);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch the model when the component mounts.
  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  // Helper to trigger a save/update mutation.  As with the query, we
  // print the mutation DocumentNode to a string before sending it.
  const saveModel = async () => {
    setSaving(true);
    try {
      await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: print(SAVE_MODEL_MUTATION) }),
      });
      // Re-fetch the model after saving to ensure the UI reflects
      // any changes persisted on the backend.
      fetchModel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Model Overview</h1>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {/* Display the list of nodes.  If there are none, show a placeholder. */}
      {!loading && !error && (
        <>
          <h2>Nodes</h2>
          {nodes.length > 0 ? (
            <ul>
              {nodes.map((node) => (
                <li key={node.name}>{node.name}</li>
              ))}
            </ul>
          ) : (
            <p>No nodes have been added yet.</p>
          )}
        </>
      )}
      <button onClick={fetchModel} disabled={loading}>
        Refresh
      </button>
      <button onClick={saveModel} disabled={saving} style={{ marginLeft: 10 }}>
        {saving ? 'Saving…' : 'Save Model'}
      </button>
    </div>
  );
};

export default ModelPage;