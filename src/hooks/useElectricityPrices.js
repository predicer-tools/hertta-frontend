// src/hooks/useElectricityPrices.js

import { useState, useEffect } from 'react';

/**
 * Custom React hook to fetch Finnish (`fi`) electricity prices
 * from the Elering API for the last full hour and the next 11 hours.
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

    // Helper function to calculate start and end times
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

      // Calculate end time: start_time + 8 hours - 1 millisecond
      // Adjusted to match the working curl command (8 hours instead of 12)
      const endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000 - 1);

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
        console.log('API Response:', data); // For debugging

        // Validate the response structure
        if (data.success && data.data && Array.isArray(data.data.fi)) {
          // Map each fi price entry to include start and end ISO strings
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

    // Optionally, set up an interval to refresh data every hour
    // const intervalId = setInterval(fetchElectricityPrices, 60 * 60 * 1000); // Every hour

    // Cleanup function to abort fetch on unmount
    return () => {
      controller.abort();
      // If using interval:
      // clearInterval(intervalId);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return { fiPrices, loading, error };
}

export default useElectricityPrices;