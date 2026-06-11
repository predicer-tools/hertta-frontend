// src/hooks/useWeatherData.js
import { useState, useEffect, useRef } from 'react';

const HASS_BACKEND_URL = window.location.pathname.replace(/\/$/, '');
const WEATHER_RETRY_INTERVAL_MS = 2_000;
const WEATHER_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
const WEATHER_STORAGE_KEY = 'weatherData';

export default function useWeatherData(_locationFromConfig) {
  const [weatherData, setWeatherData] = useState(() => {
    const stored = localStorage.getItem(WEATHER_STORAGE_KEY);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed?.weather_values) ? parsed : null;
    } catch {
      return null;
    }
  });
  const hasWeatherDataRef = useRef(Boolean(weatherData?.weather_values?.length));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let pollTimer;

    const startWeatherLoop = async () => {
      const resp = await fetch(`${HASS_BACKEND_URL}/start-weather`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!resp.ok) {
        throw new Error(`Failed to start weather task (${resp.status})`);
      }
    };

    const fetchWeather = async () => {
      if (!hasWeatherDataRef.current) {
        setLoading(true);
      }
      setError(null);
      let hasWeatherData = hasWeatherDataRef.current;

      try {
        const resp = await fetch(`${HASS_BACKEND_URL}/weather`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const json = await resp.json();

        if (!resp.ok || json.status !== 'ok') {
          throw new Error('Weather task is running, but no weather data is available yet');
        }

        const outcome = json.data;
        const times = outcome.time || [];
        const temps = outcome.temperature || [];

        const weather_values = times.map((t, i) => ({
          time: t,
          value: typeof temps[i] === "number"
            ? temps[i] - 273.15   // 🔥 Convert Kelvin → Celsius here
            : null,
        }));

        if (!cancelled && weather_values.length > 0) {
          const nextWeatherData = {
            place: "Outside",
            weather_values,
          };
          setWeatherData(nextWeatherData);
          localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(nextWeatherData));
          hasWeatherDataRef.current = true;
        }
        hasWeatherData = weather_values.length > 0 || hasWeatherDataRef.current;
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }

      return hasWeatherData;
    };

    const startAndFetchWeather = async () => {
      try {
        await startWeatherLoop();
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
      const hasWeatherData = await fetchWeather();
      scheduleNextFetch(hasWeatherData);
    };

    const scheduleNextFetch = (hasWeatherData) => {
      if (cancelled) return;

      pollTimer = window.setTimeout(async () => {
        const nextHasWeatherData = await fetchWeather();
        scheduleNextFetch(nextHasWeatherData);
      }, hasWeatherData ? WEATHER_REFRESH_INTERVAL_MS : WEATHER_RETRY_INTERVAL_MS);
    };

    void startAndFetchWeather();

    return () => {
      cancelled = true;
      window.clearTimeout(pollTimer);
    };
  }, []);

  return { weatherData, loading, error };
}
