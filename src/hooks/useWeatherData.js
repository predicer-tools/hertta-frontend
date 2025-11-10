// src/hooks/useWeatherData.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { GRAPHQL_ENDPOINT, GET_SETTINGS_QUERY } from '../graphql/queries';

/**
 * Tiny helper to POST GraphQL without Apollo.
 */
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
  } catch {
    const err = new Error(`Non-JSON response (${res.status} ${res.statusText})`);
    err.debug = { status: res.status, statusText: res.statusText, body: text };
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.debug = json;
    throw err;
  }
  if (json.errors?.length) {
    const err = new Error(json.errors.map(e => e.message).join(' | '));
    err.debug = json;
    throw err;
  }
  return json;
}

/**
 * GraphQL query to get a 12h weather forecast (example name; adjust to match your schema).
 * Assumes your backend exposes:
 *   query WeatherForecast($place: String!, $start: String!, $end: String!) {
 *     weatherForecast(place: $place, start: $start, end: $end) {
 *       time
 *       temperature
 *     }
 *   }
 *
 * If your actual field name differs, change WEATHER_FORECAST_QUERY accordingly.
 */
const WEATHER_FORECAST_QUERY = `
  query WeatherForecast($place: String!, $start: String!, $end: String!) {
    weatherForecast(place: $place, start: $start, end: $end) {
      time
      temperature
    }
  }
`;

/**
 * Visibility-aware weather fetch for next 12 hours.
 * - Fetches immediately on mount (if tab is visible).
 * - Polls only while the tab is visible.
 * - Pauses polling when the tab is hidden.
 * - On visibility back to visible, triggers an immediate fetch if stale.
 */
export default function useWeatherData(locationFromConfig) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Poll every hour while visible
  const POLL_INTERVAL_MS = 60 * 60 * 1000;
  // If we’ve been hidden and return visible, fetch immediately when the last
  // fetch is older than this threshold (also 1 hour).
  const STALE_AFTER_MS = 60 * 60 * 1000;

  const intervalRef = useRef(null);
  const lastFetchRef = useRef(0);
  const isFetchingRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const computeWindow = () => {
    // Start from current local hour (rounded down) and go 12 hours forward.
    const start = new Date();
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 12 * 60 * 60 * 1000);
    // ISO string in local time without trailing Z (backend expects local?)
    const startISO = start.toISOString().slice(0, -1);
    const endISO = end.toISOString().slice(0, -1);
    return { startISO, endISO };
  };

  const getPlace = useCallback(async () => {
    // Prefer the provided location if you pass it in; otherwise read settings.
    if (locationFromConfig && typeof locationFromConfig === 'string') {
      return locationFromConfig;
    }
    // Fallback: try your settings query (country/place combo—adjust as needed).
    try {
      const json = await graphqlRequest({ query: GET_SETTINGS_QUERY });
      const place = json?.data?.settings?.location?.place;
      return place || 'Tampere';
    } catch {
      return 'Tampere';
    }
  }, [locationFromConfig]);

  const getWeatherData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const place = await getPlace();
      const { startISO, endISO } = computeWindow();

      const json = await graphqlRequest({
        query: WEATHER_FORECAST_QUERY,
        variables: { place, start: startISO, end: endISO },
      });

      const rows = json?.data?.weatherForecast ?? null;
      if (!Array.isArray(rows)) {
        throw new Error('Invalid weather data shape.');
      }

      setWeatherData({
        place,
        start: startISO,
        end: endISO,
        weather_values: rows.map(r => ({ time: r.time, value: r.temperature })),
      });
      lastFetchRef.current = Date.now();
    } catch (e) {
      setError(e.message || 'Failed to fetch weather data.');
      setWeatherData(null);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [getPlace]);

  // Start/stop polling based on visibility.
  useEffect(() => {
    const startPolling = () => {
      clearTimer();
      intervalRef.current = setInterval(getWeatherData, POLL_INTERVAL_MS);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const stale = Date.now() - lastFetchRef.current > STALE_AFTER_MS;
        if (stale) {
          // Kick an immediate refresh when returning visible.
          getWeatherData();
        }
        startPolling();
      } else {
        // Hidden: pause polling
        clearTimer();
      }
    };

    // On mount: only fetch + start polling if visible
    if (document.visibilityState === 'visible') {
      getWeatherData();
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibility);
    // Safety for Safari’s bfcache lifecycle
    window.addEventListener('pageshow', handleVisibility);
    window.addEventListener('pagehide', clearTimer);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pageshow', handleVisibility);
      window.removeEventListener('pagehide', clearTimer);
      clearTimer();
    };
  }, [getWeatherData, clearTimer]);

  return { weatherData, loading, error };
}
