/*
 * src/pages/ModelPage.js
 */

import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { print } from 'graphql/language/printer';
// Pull in ConfigContext so we can access the Home Assistant API key
import ConfigContext from '../context/ConfigContext';
// Note: All control signal dispatch logic is handled by ControlSignalScheduler,
// which exposes updateControlSignals, clearAllSchedules, and getScheduleStatus.
// Import scheduler utilities to handle control signal dispatch outside of this page
import {
  updateControlSignals,
  clearAllSchedules,
  getScheduleStatus,
} from '../hass/ControlSignalScheduler';
import {
  GRAPHQL_ENDPOINT,
  SAVE_MODEL_MUTATION,
  START_OPTIMIZATION_MUTATION,
  JOB_STATUS_QUERY,
  UPDATE_SETTINGS_MUTATION,
  GET_JOB_OUTCOME_QUERY, // ⬅️ add this export in ../graphql/queries if not already
} from '../graphql/queries';

// Keep this as a raw string since we post it with fetch directly.
const GET_MODEL_OVERVIEW_QUERY = `
  query {
    model {
      inputData {
        nodes { name }
        processes {
          name
          topos {
            source { ... on Node { name } ... on Process { name } }
            sink   { ... on Node { name } ... on Process { name } }
          }
        }
        markets {
          name mType
          node { name }
          processGroup { name }
          direction isBid isLimited minBid maxBid fee
        }
        risk { parameter value }
        scenarios { name weight }
        genConstraints {
          name gcType isSetpoint penalty
          constant {
            scenario
            value { ... on Constant { value } ... on FloatList { values } }
          }
        }
        setup {
          reserveRealisation useMarketBids useReserves
          useNodeDummyVariables useRampDummyVariables
          nodeDummyVariableCost rampDummyVariableCost
          commonTimeSteps
        }
      }
    }
  }
`;

// Tiny helper to surface *all* error info
async function graphqlRequest({ query, variables }) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    const err = new Error(`Non-JSON response (${res.status} ${res.statusText})`);
    err.debug = { status: res.status, statusText: res.statusText, body: text };
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.debug = json;
    throw err;
  }

  if (json.errors && json.errors.length) {
    const err = new Error(json.errors.map(e => e.message).join(' | '));
    err.debug = json;
    throw err;
  }

  return json;
}

const ModelPage = () => {
  // Pull the Home Assistant configuration from context.  This provides
  // the API key needed to dispatch control signals once an optimization
  // job finishes.  The ConfigContext comes from ../context/ConfigContext.
  const { config } = useContext(ConfigContext);

  // overview data
  const [nodes, setNodes] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [risks, setRisks] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [genConstraints, setGenConstraints] = useState([]);
  const [setup, setSetup] = useState(null);

  // ui state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  // errors & debug
  const [error, setError] = useState(null);
  const [lastResponseDebug, setLastResponseDebug] = useState(null);

  // job tracking
  const [jobId, setJobId] = useState(null);
  const [jobState, setJobState] = useState(null); // QUEUED | IN_PROGRESS | FAILED | FINISHED
  const [jobMessage, setJobMessage] = useState(null);
  const pollRef = useRef(null);

  // outcome
  const [outcome, setOutcome] = useState(null);
  const [outcomeType, setOutcomeType] = useState(null);

  // Track the current control signal dispatch status.  This map contains
  // per-entity details about the last value sent and the next scheduled
  // dispatch.  It is updated periodically by polling the scheduler.
  const [scheduleStatus, setScheduleStatus] = useState({});

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const fetchOutcome = useCallback(async (id) => {
    try {
      const json = await graphqlRequest({
        query: print(GET_JOB_OUTCOME_QUERY),
        variables: { jobId: id },
      });
      setLastResponseDebug(json);
      const data = json?.data?.jobOutcome ?? null;
      if (!data) {
        setOutcome(null);
        setOutcomeType(null);
        return;
      }
      const t = data.__typename || (
        data.controlSignals ? 'OptimizationOutcome' :
        data.temperature    ? 'WeatherForecastOutcome' :
        data.price          ? 'ElectricityPriceOutcome' :
        'Unknown'
      );
      setOutcomeType(t);
      setOutcome(data);

      // If we have an optimisation outcome with control signals, delegate
      // scheduling to the ControlSignalScheduler.  It will replace any
      // existing schedules and manage dispatch on an hourly basis.
      if (t === 'OptimizationOutcome' && Array.isArray(data.controlSignals)) {
        updateControlSignals(config?.apiKey, data.controlSignals);
      }
    } catch (e) {
      setError(e.message);
      setLastResponseDebug(e.debug ?? null);
    }
  }, [config]);

  const pollJobStatus = useCallback(async (id) => {
    try {
      const json = await graphqlRequest({
        query: print(JOB_STATUS_QUERY),
        variables: { jobId: id },
      });
      setLastResponseDebug(json);
      const status = json?.data?.jobStatus;
      const s = status?.state ?? null;
      setJobState(s);
      setJobMessage(status?.message ?? null);

      if (s === 'FAILED') {
        stopPolling();
      }
      if (s === 'FINISHED') {
        stopPolling();
        // fetch outcome once finished
        await fetchOutcome(id);
      }
    } catch (e) {
      setError(e.message);
      setLastResponseDebug(e.debug ?? null);
      stopPolling();
    }
  }, [fetchOutcome]);

  const fetchModel = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLastResponseDebug(null);
    try {
      const json = await graphqlRequest({ query: GET_MODEL_OVERVIEW_QUERY });
      setLastResponseDebug(json);
      const inputData = json?.data?.model?.inputData ?? {};
      setNodes(inputData.nodes ?? []);
      setProcesses(inputData.processes ?? []);
      setMarkets(inputData.markets ?? []);
      setRisks(inputData.risk ?? []);
      setScenarios(inputData.scenarios ?? []);
      setGenConstraints(inputData.genConstraints ?? []);
      setSetup(inputData.setup ?? null);
    } catch (e) {
      setError(e.message);
      setLastResponseDebug(e.debug ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModel();
    return () => {
      // Clean up polling and any scheduled control signal intervals on unmount.
      stopPolling();
      clearAllSchedules();
    };
  }, [fetchModel]);

  // Periodically update the local scheduleStatus state by polling the
  // ControlSignalScheduler.  This effect runs once on mount and
  // establishes an interval that retrieves the latest schedule status every
  // few seconds.  When the component unmounts, the interval is cleared.
  useEffect(() => {
    const interval = setInterval(() => {
      setScheduleStatus(getScheduleStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const saveModel = async () => {
    setSaving(true);
    setError(null);
    setLastResponseDebug(null);
    try {
      const json = await graphqlRequest({ query: print(SAVE_MODEL_MUTATION) });
      setLastResponseDebug(json);
      await fetchModel();
    } catch (e) {
      setError(e.message);
      setLastResponseDebug(e.debug ?? null);
    } finally {
      setSaving(false);
    }
  };

  const saveAndStartOptimization = async () => {
    setStarting(true);
    setError(null);
    setLastResponseDebug(null);
    setJobId(null);
    setJobState(null);
    setJobMessage(null);
    // Clear any existing schedules before resetting the outcome state.  This
    // ensures that outdated control signals are not sent while a new
    // optimisation run is starting.
    clearAllSchedules();
    setOutcome(null);
    setOutcomeType(null);
    stopPolling();

    try {
      // 1) Save
      const saveJson = await graphqlRequest({ query: print(SAVE_MODEL_MUTATION) });
      setLastResponseDebug(saveJson);

      // 2) Start
      const startJson = await graphqlRequest({ query: print(START_OPTIMIZATION_MUTATION) });
      setLastResponseDebug(startJson);
      const id = startJson?.data?.startOptimization ?? null;
      setJobId(id);

      if (id != null) {
        // 3) Poll job status every 2s
        await pollJobStatus(id);
        pollRef.current = setInterval(() => pollJobStatus(id), 2000);
      } else {
        setError('No jobId returned from startOptimization.');
      }
    } catch (e) {
      setError(e.message);
      setLastResponseDebug(e.debug ?? null);
    } finally {
      setStarting(false);
    }
  };

  const updateLocationToTampere = async () => {
    setUpdatingLocation(true);
    setError(null);
    setLastResponseDebug(null);
    try {
      const json = await graphqlRequest({
        query: print(UPDATE_SETTINGS_MUTATION),
        variables: {
          settingsInput: {
            location: { country: 'Finland', place: 'Tampere' },
          },
        },
      });
      setLastResponseDebug(json);
      await fetchModel();
    } catch (e) {
      setError(e.message);
      setLastResponseDebug(e.debug ?? null);
    } finally {
      setUpdatingLocation(false);
    }
  };

  // Manually apply the control signals again
  // This helper loops over the control signals we received from the optimization
  // job and schedules them to be sent to Home Assistant using the same timing
  // logic (one hour between each value).  It is exposed as a button in the UI
  // so the user can reapply the last optimization outcome on demand.
  const applyControlSignalsNow = () => {
    if (outcomeType === 'OptimizationOutcome' && Array.isArray(outcome?.controlSignals)) {
      // Delegate to the ControlSignalScheduler to apply the most recent
      // optimisation control signals.  The scheduler will start a new
      // schedule for each entity and replace any existing schedules.
      updateControlSignals(config?.apiKey, outcome.controlSignals);
    }
  };

  // Small helpers for rendering OptimizationOutcome
  const renderOptimizationOutcome = () => {
    if (!outcome || outcomeType !== 'OptimizationOutcome') return null;

    const times = outcome.time ?? [];
    const firstTs = times[0] ?? '–';
    const lastTs = times[times.length - 1] ?? '–';

    return (
      <div style={{ marginTop: 24 }}>
        <h2>Optimization Outcome</h2>
        <div style={{ marginBottom: 6 }}>
          <div>Time points: {times.length}</div>
          <div>Range: {String(firstTs)} → {String(lastTs)}</div>
        </div>

        {(outcome.controlSignals ?? []).length === 0 ? (
          <p>No control signals.</p>
        ) : (
          <div>
            {(outcome.controlSignals ?? []).map(sig => {
              const sample = Array.isArray(sig.signal) ? sig.signal.slice(0, 8) : [];
              const zeros = Array.isArray(sig.signal) && sig.signal.every(v => v === 0);
              return (
                <div key={sig.name} style={{ marginBottom: 10 }}>
                  <strong>{sig.name}</strong>{' '}
                  <span style={{ opacity: 0.7 }}>
                    ({sig.signal?.length ?? 0} values{zeros ? ', all zero' : ''})
                  </span>
                  <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    [{sample.join(', ')}{sig.signal && sig.signal.length > sample.length ? ', …' : ''}]
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderNonOptimizationOutcome = () => {
    if (!outcome || (outcomeType === 'OptimizationOutcome' || !outcomeType)) return null;

    return (
      <div style={{ marginTop: 24 }}>
        <h2>{outcomeType}</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(outcome, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Model Overview</h1>

      {(loading || saving || starting) && <p>Working…</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {jobId !== null && (
        <div style={{ marginBottom: 12 }}>
          <strong>Optimization Job:</strong> #{jobId}{' '}
          {jobState && <span>— state: <em>{jobState}</em></span>}
          {jobMessage && <div>message: {jobMessage}</div>}
        </div>
      )}

      {/* Outcome sections */}
      {renderOptimizationOutcome()}
      {renderNonOptimizationOutcome()}

      {/* Display current control signal dispatch status.  Shows the last
          value sent to each entity and when it was sent, as well as the
          next value and its scheduled dispatch time. */}
      {Object.keys(scheduleStatus).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Control Signal Dispatch</h2>
          <ul>
            {Object.entries(scheduleStatus).map(([entity, st]) => (
              <li key={entity} style={{ marginBottom: 4 }}>
                <strong>{entity}</strong>: last&nbsp;
                {st.lastValue !== null && st.lastValue !== undefined ? st.lastValue : '–'}&nbsp;
                at&nbsp;
                {st.lastSentAt instanceof Date
                  ? st.lastSentAt.toLocaleString()
                  : st.lastSentAt || '–'}
                , next&nbsp;
                {st.nextValue !== null && st.nextValue !== undefined ? st.nextValue : '–'}&nbsp;
                at&nbsp;
                {st.nextSentAt instanceof Date
                  ? st.nextSentAt.toLocaleString()
                  : st.nextSentAt || '–'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && (
        <>
          <h2>Setup</h2>
          {setup ? (
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(setup, null, 2)}</pre>
          ) : <p>No setup found.</p>}

          <h2>Risk</h2>
          {risks.length ? (
            <ul>{risks.map(r => <li key={r.parameter}>{r.parameter}: {r.value}</li>)}</ul>
          ) : <p>No risk parameters set.</p>}

          <h2>Scenarios</h2>
          {scenarios.length ? (
            <ul>{scenarios.map(s => <li key={s.name}>{s.name} — weight: {s.weight}</li>)}</ul>
          ) : <p>No scenarios defined.</p>}

          <h2>Nodes</h2>
          {nodes.length ? (
            <ul>{nodes.map(n => <li key={n.name}>{n.name}</li>)}</ul>
          ) : <p>No nodes.</p>}

          <h2>Processes</h2>
          {processes.length ? (
            <ul>
              {processes.map(proc => (
                <li key={proc.name}>
                  {proc.name}
                  {proc.topos?.length ? (
                    <ul>
                      {proc.topos.map((t, i) => (
                        <li key={`${proc.name}-topo-${i}`}>
                          {(t?.source?.name ?? '(?)')} → {(t?.sink?.name ?? '(?)')}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : <p>No processes.</p>}

          <h2>Markets</h2>
          {markets.length ? (
            <ul>
              {markets.map(mkt => (
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
          ) : <p>No markets.</p>}

          <h2>Generic Constraints</h2>
          {genConstraints.length ? (
            <ul>
              {genConstraints.map(gc => (
                <li key={gc.name}>
                  {gc.name} — {gc.gcType} — setpoint: {String(gc.isSetpoint)} — penalty: {gc.penalty}
                  <ul>
                    {gc.constant.map((c, i) => (
                      <li key={`${gc.name}-const-${i}`}>
                        Constant: {c.value?.value ?? (c.value?.values ? c.value.values.join(', ') : '—')}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : <p>No generic constraints.</p>}
        </>
      )}

      <div style={{ marginTop: 16 }}>
        <button onClick={fetchModel} disabled={loading}>Refresh</button>
        <button onClick={saveModel} disabled={saving} style={{ marginLeft: 10 }}>
          {saving ? 'Saving…' : 'Save Model'}
        </button>
        <button onClick={saveAndStartOptimization} disabled={saving || starting} style={{ marginLeft: 10 }}>
          {starting ? 'Saving & Starting…' : 'Save & Start Optimization'}
        </button>
        {jobId !== null && (
          <>
            <button
              onClick={() => pollJobStatus(jobId)}
              disabled={starting}
              style={{ marginLeft: 10 }}
            >
              Check Job Status Now
            </button>
            <button
              onClick={() => fetchOutcome(jobId)}
              disabled={starting}
              style={{ marginLeft: 10 }}
              title="Fetch job outcome now"
            >
              Fetch Outcome
            </button>
          </>
        )}
        <button
          onClick={updateLocationToTampere}
          disabled={updatingLocation}
          style={{ marginLeft: 10 }}
          title="Set Settings.location to Finland / Tampere"
        >
          {updatingLocation ? 'Updating Location…' : 'Set Location: Tampere'}
        </button>

        {/* Button to manually reapply control signals.
            This appears only when there is a finished optimization outcome with control signals. */}
        {outcomeType === 'OptimizationOutcome' && Array.isArray(outcome?.controlSignals) && outcome.controlSignals.length > 0 && (
          <button
            onClick={applyControlSignalsNow}
            disabled={!outcome || outcomeType !== 'OptimizationOutcome'}
            style={{ marginLeft: 10 }}
            title="Apply the most recent control signals to Home Assistant again"
          >
            Apply Control Signals
          </button>
        )}
      </div>

      {/* Debug panel to see the last raw response or error payload */}
      {lastResponseDebug && (
        <div style={{ marginTop: 20 }}>
          <h3>Last GraphQL Response (debug)</h3>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}>
            {JSON.stringify(lastResponseDebug, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ModelPage;
