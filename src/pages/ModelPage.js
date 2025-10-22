/*
 * src/pages/ModelPage.js
 */

import React, { useState, useEffect, useCallback } from 'react';
import { print } from 'graphql/language/printer';
import { GRAPHQL_ENDPOINT, SAVE_MODEL_MUTATION } from '../graphql/queries';

// Include process topos (source/sink names)
const GET_MODEL_OVERVIEW_QUERY = `
  query {
    model {
      inputData {
        nodes { name }
        processes {
          name
          topos {
            source {
              ... on Node { name }
              ... on Process { name }
            }
            sink {
              ... on Node { name }
              ... on Process { name }
            }
          }
        }
        setup {
          reserveRealisation
          useMarketBids
          useReserves
          useNodeDummyVariables
          useRampDummyVariables
          nodeDummyVariableCost
          rampDummyVariableCost
          commonTimeSteps
        }
      }
    }
  }
`;

const ModelPage = () => {
  const [nodes, setNodes] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

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
        const inputData = result?.data?.model?.inputData || {};
        const fetchedNodes = inputData.nodes || [];
        const fetchedProcesses = inputData.processes || [];
        const fetchedSetup = inputData.setup || null;
        setNodes(fetchedNodes);
        setProcesses(fetchedProcesses);
        setSetup(fetchedSetup);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  const saveModel = async () => {
    setSaving(true);
    try {
      await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: print(SAVE_MODEL_MUTATION) }),
      });
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
      {!loading && !error && (
        <>
          <h2>Setup</h2>
          {setup ? (
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(setup, null, 2)}
            </pre>
          ) : (
            <p>No setup found.</p>
          )}

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
                <li key={proc.name}>
                  {proc.name}
                  {proc.topos && proc.topos.length > 0 && (
                    <ul>
                      {proc.topos.map((t, idx) => {
                        const src = t?.source?.name ?? '(?)';
                        const sink = t?.sink?.name ?? '(?)';
                        return <li key={`${proc.name}-topo-${idx}`}>{`${src} → ${sink}`}</li>;
                      })}
                    </ul>
                  )}
                </li>
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
