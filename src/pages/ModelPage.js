/*
 * src/pages/ModelPage.js
 *
 * A React component that displays the current optimisation model stored
 * in the GraphQL backend.  This version extends the original
 * implementation by also fetching and displaying the list of
 * processes in the model.  We still fetch nodes as before, but now
 * use a single query to retrieve both node names and process names.
 * When using the Apollo gql tag, the exported queries are
 * DocumentNode objects, so we must print them to strings before
 * sending them through fetch.  Using plain strings here avoids
 * calling print() and keeps the payloads small.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { print } from 'graphql/language/printer';
import { GRAPHQL_ENDPOINT, SAVE_MODEL_MUTATION } from '../graphql/queries';

// Define a query that fetches both node names and process names.  Using a
// plain string avoids the need to call print() on a DocumentNode.
const GET_MODEL_OVERVIEW_QUERY = `
  query {
    model {
      inputData {
        nodes {
          name
        }
        processes {
          name
        }
      }
    }
  }
`;

const ModelPage = () => {
  // Track nodes and processes instead of the entire model.  Each entry
  // is an object with at least a `name` property.
  const [nodes, setNodes] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Helper to fetch the model via GraphQL.  We send our custom query
  // directly as a string because GET_MODEL_OVERVIEW_QUERY is already a
  // string.  The server responds with nodes and processes.
  const fetchModel = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_MODEL_OVERVIEW_QUERY }),
      });
      const result = await response.json();
      if (result.errors) {
        setError(result.errors.map((e) => e.message).join(', '));
      } else {
        const fetchedNodes = result?.data?.model?.inputData?.nodes || [];
        const fetchedProcesses = result?.data?.model?.inputData?.processes || [];
        setNodes(fetchedNodes);
        setProcesses(fetchedProcesses);
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
      {/* Display the list of nodes and processes.  If there are none, show placeholders. */}
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
          <h2>Processes</h2>
          {processes.length > 0 ? (
            <ul>
              {processes.map((proc) => (
                <li key={proc.name}>{proc.name}</li>
              ))}
            </ul>
          ) : (
            <p>No processes have been added yet.</p>
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