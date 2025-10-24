/*
 * src/pages/ModelPage.js
 */

import React, { useState, useEffect, useCallback } from 'react';
import { print } from 'graphql/language/printer';
import { GRAPHQL_ENDPOINT, SAVE_MODEL_MUTATION } from '../graphql/queries';

// Include process topos (source/sink names) + markets + risk
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
        markets {
          name
          mType
          node { name }
          processGroup { name }
          direction
          isBid
          isLimited
          minBid
          maxBid
          fee
        }
        risk {
          parameter
          value
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
  const [markets, setMarkets] = useState([]);
  const [risks, setRisks] = useState([]);
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
        setNodes(inputData.nodes || []);
        setProcesses(inputData.processes || []);
        setMarkets(inputData.markets || []);
        setRisks(inputData.risk || []);
        setSetup(inputData.setup || null);
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

          <h2>Risk</h2>
          {risks.length > 0 ? (
            <ul>
              {risks.map((r) => (
                <li key={r.parameter}>{r.parameter}: {r.value}</li>
              ))}
            </ul>
          ) : (
            <p>No risk parameters set.</p>
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
                        return (
                          <li key={`${proc.name}-topo-${idx}`}>{`${src} → ${sink}`}</li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No processes have been added yet.</p>
          )}

          <h2>Markets</h2>
          {markets.length > 0 ? (
            <ul>
              {markets.map((mkt) => (
                <li key={mkt.name}>
                  {mkt.name} — {mkt.mType}
                  <ul>
                    <li>node: {mkt.node?.name || '-'}</li>
                    <li>processGroup: {mkt.processGroup?.name || '-'}</li>
                    <li>direction: {mkt.direction || 'none'}</li>
                    <li>isBid: {String(mkt.isBid)}</li>
                    <li>isLimited: {String(mkt.isLimited)}</li>
                    <li>minBid: {mkt.minBid}</li>
                    <li>maxBid: {mkt.maxBid}</li>
                    <li>fee: {mkt.fee}</li>
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p>No markets have been added yet.</p>
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
