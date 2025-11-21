// src/hooks/useWeatherData.js
import { useState, useEffect } from 'react';

const HASS_BACKEND_URL = 'http://localhost:4001';

export default function useWeatherData(_locationFromConfig) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

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
          throw new Error("No weather data available");
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

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  return { weatherData, loading, error };
}
