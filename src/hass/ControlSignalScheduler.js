/*
 * ControlSignalScheduler.js
 *
 * This module encapsulates the logic required to schedule and send control
 * signals from optimisation outcomes to Home Assistant.  Each optimisation
 * outcome contains a list of control signals where each signal has a name
 * (corresponding to an entity identifier and additional metadata) and a
 * sequence of numeric values representing the desired setpoint for each
 * future hour.  The scheduler maintains per‑entity intervals that send
 * values to Home Assistant at hourly intervals.  When new control signals
 * arrive they replace any existing schedule for the same entity.  If new
 * signals do not arrive in time, the scheduler continues to send the
 * fallback (last known) value on an hourly basis.
 */

import { sendControlSignalToHomeAssistant } from './HomeAssistantInterface';

// Valid Home Assistant domains.  Only entities from these domains will
// be scheduled for dispatch.  Entities from other domains are ignored.
const VALID_DOMAINS = new Set(['switch', 'light', 'climate', 'number', 'fan', 'cover']);

// Internal map of schedules keyed by entity_id.  Each entry has the shape:
// {
//   values: number[],    // array of scheduled values from the latest optimisation
//   index: number,       // next index into values to dispatch
//   fallback: number,    // value to keep sending after values are exhausted
//   intervalId: number,  // identifier returned by setInterval
// }
const schedules = {};

// Map storing status information per entity.  Each entry has the shape:
// {
//   lastValue: number | null,    // most recently dispatched value
//   lastSentAt: Date | null,     // timestamp of last dispatch
//   nextValue: number | null,    // value scheduled for next dispatch
//   nextSentAt: Date | null,     // timestamp of next scheduled dispatch
// }
const status = {};

/**
 * Extract a Home Assistant entity_id from a control signal name.  Many
 * optimisation names follow patterns like:
 *
 *   light.led_strips_4_8w_m_rgb_827_865_1m_9610358_electricitygrid_light.led_strips_4_8w_m_rgb_827_865_1m_9610358_s1
 *
 * The real entity_id is everything before the marker `_electricitygrid`.
 * If no marker exists, the function accumulates underscore‑separated parts
 * until the domain appears twice, which indicates a repetition of the
 * entity identifier.  This heuristic handles names of the form
 * `domain.object_domain.object_scenario` by returning just the first
 * `domain.object`.  If the resulting string is not a valid entity
 * (missing a dot or belonging to an unsupported domain), an empty
 * string is returned.
 *
 * @param {string} name The raw control signal name from the optimisation.
 * @returns {string} The extracted entity_id or an empty string if none.
 */
export function extractEntityId(name) {
  if (typeof name !== 'string' || !name.includes('.')) {
    return '';
  }
  // Prefer simple case: if the name contains `_electricitygrid`, cut before it.
  const marker = '_electricitygrid';
  const idx = name.indexOf(marker);
  if (idx > 0) {
    const entityId = name.substring(0, idx);
    const domain = entityId.split('.')[0];
    return VALID_DOMAINS.has(domain) ? entityId : '';
  }
  // General case: accumulate parts until we see the domain repeated.
  const parts = name.split('_');
  const firstDot = name.indexOf('.');
  const domain = name.slice(0, firstDot);
  let entityParts = [];
  let seenDomainCount = 0;
  for (const part of parts) {
    entityParts.push(part);
    if (part === domain || part.startsWith(domain + '.')) {
      seenDomainCount++;
      if (seenDomainCount > 1) {
        // Remove the duplicate domain part and stop.
        entityParts.pop();
        break;
      }
    }
  }
  const candidate = entityParts.join('_');
  if (!candidate.includes('.')) {
    return '';
  }
  const candDomain = candidate.split('.')[0];
  return VALID_DOMAINS.has(candDomain) ? candidate : '';
}

/**
 * Start or update a schedule for a given entity.  If a schedule already
 * exists for the entity, its interval is cleared and replaced with a new
 * interval based on the provided values.  The first value is dispatched
 * immediately, and subsequent values are dispatched every hour.  Once
 * the schedule runs out of values, the fallback (last value) is sent
 * repeatedly at hourly intervals until a new schedule arrives.
 *
 * @param {string} apiKey Home Assistant long‑lived access token.
 * @param {string} entityId The Home Assistant entity_id.
 * @param {number[]} values Array of numeric control values.
 */
function startOrUpdateSchedule(apiKey, entityId, values) {
  if (!entityId || !Array.isArray(values)) {
    return;
  }
  // Cancel any existing interval for this entity.
  const existing = schedules[entityId];
  if (existing && existing.intervalId) {
    clearInterval(existing.intervalId);
  }
  // Initialize a new schedule object.
  const schedule = {
    values: values.slice(),
    index: 0,
    fallback: values.length > 0 ? values[values.length - 1] : 0,
    intervalId: null,
  };
  schedules[entityId] = schedule;
  // Immediately send the first value.
  if (schedule.values.length > 0) {
    // Send the first value immediately
    const firstValue = schedule.values[0];
    sendControlSignalToHomeAssistant(apiKey, entityId, firstValue);
    // Update status for the first dispatch
    status[entityId] = {
      lastValue: firstValue,
      lastSentAt: new Date(),
      nextValue: schedule.values.length > 1 ? schedule.values[1] : schedule.fallback,
      nextSentAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  } else {
    // No values to send immediately; still initialise status
    status[entityId] = {
      lastValue: null,
      lastSentAt: null,
      nextValue: schedule.fallback,
      nextSentAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }
  // Create an interval to dispatch subsequent values every hour (3600000 ms).
  schedule.intervalId = setInterval(() => {
    schedule.index++;
    let value;
    if (schedule.index < schedule.values.length) {
      value = schedule.values[schedule.index];
    } else {
      value = schedule.fallback;
    }
    // Dispatch the value
    sendControlSignalToHomeAssistant(apiKey, entityId, value);
    // Update status with this dispatch and compute the next one
    const nextIdx = schedule.index + 1;
    const nextValue = nextIdx < schedule.values.length ? schedule.values[nextIdx] : schedule.fallback;
    status[entityId] = {
      lastValue: value,
      lastSentAt: new Date(),
      nextValue: nextValue,
      nextSentAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }, 60 * 60 * 1000);
}

/**
 * Update schedules based on a new set of control signals.  Each signal is
 * parsed to extract the entity_id and the list of values.  Signals with
 * unsupported domains or malformed names are skipped.  Existing schedules
 * for the same entities are replaced.
 *
 * @param {string} apiKey Home Assistant long‑lived access token.
 * @param {Array} controlSignals Array of control signal objects from the optimisation outcome.
 */
export function updateControlSignals(apiKey, controlSignals) {
  if (!Array.isArray(controlSignals)) {
    return;
  }
  controlSignals.forEach((sig) => {
    const entityId = extractEntityId(sig.name);
    if (!entityId) {
      return;
    }
    const values = Array.isArray(sig.signal) ? sig.signal : [];
    startOrUpdateSchedule(apiKey, entityId, values);
  });
}

/**
 * Clear all schedules.  This stops all intervals and removes all tracked
 * entities.  Should be called when the optimisation is cancelled or when
 * leaving the page to prevent orphaned intervals.
 */
export function clearAllSchedules() {
  Object.keys(schedules).forEach((entityId) => {
    const schedule = schedules[entityId];
    if (schedule && schedule.intervalId) {
      clearInterval(schedule.intervalId);
    }
  });
  // Reset the schedules object.
  for (const key in schedules) {
    delete schedules[key];
  }
  // Reset the status object.
  for (const key in status) {
    delete status[key];
  }
}

/**
 * Retrieve the current status for all scheduled control signals.  The
 * returned object maps each entity_id to its last dispatched value,
 * timestamp, and the next scheduled value and timestamp.  Consumers of
 * this function should treat the returned object as read‑only.
 *
 * @returns {Object} A shallow copy of the status map.
 */
export function getScheduleStatus() {
  // Return a shallow copy to prevent external mutation of internal state.
  return { ...status };
}
