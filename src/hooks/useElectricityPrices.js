import { useState, useEffect } from 'react';

/**
 * Custom React hook to fetch Finnish (`fi`) electricity prices
 * from the Elering API for the current hour and the next 7 hours.
 *
 * @returns {Object} - Contains `fiPrices`, `loading`, and `error` states.
 */
function useElectricityPrices() {
  const [fiPrices, setFiPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const calculateTimeWindow = () => {
      const now = new Date();

      // Round down to the last full hour (UTC)
      const startTime = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        0,
        0,
        0
      ));

      // Calculate end time: start_time + 8 hours
      const endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000);

      return {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      };
    };

    const fetchElectricityPrices = async () => {
      setLoading(true);
      setError(null);

      const { start, end } = calculateTimeWindow();

      const apiUrl = `https://dashboard.elering.ee/api/nps/price?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

      try {
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': '*/*',
          },
          signal,
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data?.fi && Array.isArray(data.data.fi)) {
          const mappedFiPrices = data.data.fi.map(entry => ({
            start: new Date(entry.timestamp * 1000).toISOString(),
            end: new Date((entry.timestamp + 3600) * 1000).toISOString(), // +1 hour
            price: entry.price,
          }));
          setFiPrices(mappedFiPrices);
        } else {
          throw new Error('Invalid data format received from API.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching electricity prices:', err);
          setError(err.message || 'An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchElectricityPrices();

    // Cleanup function to abort fetch on unmount
    return () => {
      controller.abort();
    };
  }, []);

  return { fiPrices, loading, error };
}

export default useElectricityPrices;
