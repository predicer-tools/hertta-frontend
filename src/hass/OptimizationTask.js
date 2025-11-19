// src/hass/OptimizationTask.js

import { print } from 'graphql/language/printer';
import {
  SAVE_MODEL_MUTATION,
  START_OPTIMIZATION_MUTATION,
  JOB_STATUS_QUERY,
  GET_JOB_OUTCOME_QUERY,
} from '../graphql/queries';

import { updateControlSignals, clearAllSchedules } from './ControlSignalScheduler';

/**
 * Run the full optimisation workflow and schedule control signals:
 *  1) Save model
 *  2) Start optimisation job
 *  3) Poll job status until FINISHED / FAILED
 *  4) Fetch job outcome
 *  5) Send control signals to Home Assistant via ControlSignalScheduler
 *
 * The caller can provide callbacks to keep UI state in sync.
 */
export async function runOptimizationAndSchedule({
  graphqlRequest,
  apiKey,
  onJobId,       // (jobId: number | string) => void
  onJobState,    // (state: string | null) => void
  onJobMessage,  // (message: string | null) => void
  onOutcome,     // (outcome: any) => void
  onDebug,       // (debugPayload: any) => void
}) {
  // Always start from a clean slate for control signals
  clearAllSchedules();

  // --- 1) Save model ---
  const saveJson = await graphqlRequest({ query: print(SAVE_MODEL_MUTATION) });
  if (onDebug) onDebug(saveJson);

  // --- 2) Start optimisation job ---
  const startJson = await graphqlRequest({ query: print(START_OPTIMIZATION_MUTATION) });
  if (onDebug) onDebug(startJson);

  const jobId = startJson?.data?.startOptimization ?? null;
  if (onJobId) onJobId(jobId);

  if (jobId == null) {
    throw new Error('No jobId returned from startOptimization.');
  }

  // --- 3) Poll job status until FINISHED/FAILED ---
  let state = null;
  let message = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const statusJson = await graphqlRequest({
      query: print(JOB_STATUS_QUERY),
      variables: { jobId },
    });
    if (onDebug) onDebug(statusJson);

    const status = statusJson?.data?.jobStatus;
    state = status?.state ?? null;
    message = status?.message ?? null;

    if (onJobState) onJobState(state);
    if (onJobMessage) onJobMessage(message);

    if (state === 'FAILED' || state === 'FINISHED') {
      break;
    }

    // Wait 2 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (state !== 'FINISHED') {
    // Job failed; nothing more to do
    return;
  }

  // --- 4) Fetch job outcome ---
  const outcomeJson = await graphqlRequest({
    query: print(GET_JOB_OUTCOME_QUERY),
    variables: { jobId },
  });
  if (onDebug) onDebug(outcomeJson);

  const outcome = outcomeJson?.data?.jobOutcome ?? null;
  if (!outcome) {
    return;
  }

  if (onOutcome) {
    onOutcome(outcome);
  }

  // --- 5) Schedule/apply control signals via ControlSignalScheduler ---
  if (Array.isArray(outcome.controlSignals) && apiKey) {
    updateControlSignals(apiKey, outcome.controlSignals);
  }
}
