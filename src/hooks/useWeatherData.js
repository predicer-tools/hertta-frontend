// src/hooks/useWeatherData.js
import { useState, useEffect } from 'react';

const HASS_BACKEND_URL = '';
const WEATHER_POLL_INTERVAL_MS = 30_000;

export default function useWeatherData(_locationFromConfig) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

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
      setLoading(true);
      setError(null);

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

        if (!cancelled) {
          setWeatherData({
            place: "Outside",
            weather_values,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setWeatherData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const startAndFetchWeather = async () => {
      try {
        await startWeatherLoop();
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
      await fetchWeather();
    };

    void startAndFetchWeather();
    const pollTimer = window.setInterval(() => {
      void fetchWeather();
    }, WEATHER_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(pollTimer);
    };
  }, []);

  return { weatherData, loading, error };
}
