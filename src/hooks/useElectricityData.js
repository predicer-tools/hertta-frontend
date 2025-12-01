// src/hooks/useElectricityData.js
import { useState, useEffect } from 'react';

const HASS_BACKEND_URL = 'http://localhost:4001';

// Configurable constants for tax and marginal price
const TAX_PERCENTAGE = 25.5;      // 25.5% tax
const MARGINAL_PRICE = 0.0;       // 0.0 c/kWh (adjust if needed)

/**
 * Fetch FI electricity prices from the Rust backend.
 *
 * Backend contract:
 *  POST /start-prices      -> starts hourly GraphQL price job loop (idempotent-ish)
 *  POST /prices            -> returns:
 *    {
 *      "status": "ok",
 *      "data": {
 *        "__typename": "ElectricityPriceOutcome",
 *        "time":  [ "2025-01-01T10:00:00Z", ... ],
 *        "price": [ 123.45, ... ]   // assumed €/MWh
 *      }
 *    }
 */
const useElectricityData = () => {
  const [fiPrices, setFiPrices] = useState(() => {
    const stored = localStorage.getItem('fiElectricityPrices');
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [fiPricesLoading, setFiPricesLoading] = useState(false);
  const [fiPricesError, setFiPricesError] = useState(null);

  useEffect(() => {
    let aborted = false;
    let intervalId = null;

    const ensurePriceLoopStarted = async () => {
      try {
        const resp = await fetch(`${HASS_BACKEND_URL}/start-prices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        // If backend returns { status: "already_running" } it's fine.
        await resp.json().catch(() => ({}));
      } catch (err) {
        console.error('Failed to start price loop on backend:', err);
      }
    };

    const fetchElectricityPricesOnce = async () => {
      if (aborted) return;

      setFiPricesLoading(true);
      setFiPricesError(null);

      try {
        const resp = await fetch(`${HASS_BACKEND_URL}/prices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!resp.ok) {
          throw new Error(`Backend /prices failed with HTTP ${resp.status}`);
        }

        const json = await resp.json();
        if (aborted) return;

        if (json.status !== 'ok' || !json.data) {
          console.warn('No electricity price data from backend:', json);
          setFiPrices([]);
          return;
        }

        const outcome = json.data;
        const times = Array.isArray(outcome.time) ? outcome.time : [];
        const prices = Array.isArray(outcome.price) ? outcome.price : [];

        const len = Math.min(times.length, prices.length);
        const processed = [];

        for (let i = 0; i < len; i++) {
          const t = times[i];
          const p = prices[i];

          if (typeof p !== 'number' || !t) continue;

          // Assume GraphQL prices are €/MWh -> convert to c/kWh:
          // 1 MWh = 1000 kWh; 1 € = 100 c
          // €/MWh -> €/kWh = value / 1000
          // €/kWh -> c/kWh   = (value / 1000) * 100 = value * 0.1
          const basePriceCentsPerKWh = p * 0.1;
          const priceWithTax = basePriceCentsPerKWh * (1 + TAX_PERCENTAGE / 100);
          const finalPrice = priceWithTax + MARGINAL_PRICE;

          const localTs = new Date(t).toLocaleString('fi-FI', {
            timeZone: 'Europe/Helsinki',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).replace(',', ' klo');

          processed.push({
            timestampUTC: t,
            timestampLocal: localTs,
            finalPrice: finalPrice.toFixed(2),
          });
        }

        setFiPrices(processed);
        localStorage.setItem('fiElectricityPrices', JSON.stringify(processed));
      } catch (err) {
        if (!aborted) {
          console.error('Error fetching electricity prices from Rust backend:', err);
          setFiPricesError(err.message || 'An unexpected error occurred.');
        }
      } finally {
        if (!aborted) {
          setFiPricesLoading(false);
        }
      }
    };

    (async () => {
      await ensurePriceLoopStarted();
      await fetchElectricityPricesOnce();

      // Optional polling: refresh once per hour to pick up new values
      intervalId = window.setInterval(fetchElectricityPricesOnce, 60 * 60 * 1000);
    })();

    return () => {
      aborted = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  return { fiPrices, fiPricesLoading, fiPricesError };
};

export default useElectricityData;
