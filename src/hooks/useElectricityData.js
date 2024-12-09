// src/hooks/useElectricityData.js

import { useState, useEffect } from 'react';

// Configurable constants for tax and marginal price
const TAX_PERCENTAGE = 25.5; // 25.5% tax
const MARGINAL_PRICE = 0.0; // 0.0 c/kWh (as per your original code; adjust if needed)

const useElectricityData = () => {
  const [fiPrices, setFiPrices] = useState([]);
  const [fiPricesLoading, setFiPricesLoading] = useState(false);
  const [fiPricesError, setFiPricesError] = useState(null);

  useEffect(() => {
    const fetchElectricityPrices = async () => {
      setFiPricesLoading(true);
      setFiPricesError(null);

      try {
        // Get current time in UTC
        const now = new Date();

        // Start time: Round down to the last full hour
        const startTime = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(),
          0,
          0
        ));

        // End time: Add 12 hours to start_time
        const endTime = new Date(startTime.getTime() + 12 * 60 * 60 * 1000);

        // Convert times to ISO format for the API (UTC)
        const startTimeISO = startTime.toISOString();
        const endTimeISO = endTime.toISOString();

        console.log(`Fetching prices from ${startTimeISO} to ${endTimeISO}`); // Debugging output

        const apiUrl = `http://localhost:5000/api/electricity-prices?start_time=${encodeURIComponent(
          startTimeISO
        )}&end_time=${encodeURIComponent(endTimeISO)}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const jsonData = await response.json();

        // Process the "fi" values and calculate prices with tax and marginal
        if (jsonData.data?.fi) {
          const processedPrices = jsonData.data.fi.map((entry) => {
            const basePriceCentsPerKWh = entry.price * 0.1; // Convert €/MWh to c/kWh
            const priceWithTax = basePriceCentsPerKWh * (1 + TAX_PERCENTAGE / 100);
            const finalPrice = priceWithTax + MARGINAL_PRICE; // Add marginal

            return {
              timestampUTC: entry.timestamp, // Original timestamp from API
              timestampLocal: new Date(entry.timestamp * 1000).toLocaleString("fi-FI", {
                timeZone: "Europe/Helsinki",
              }), // Convert to Finnish time
              finalPrice: finalPrice.toFixed(2), // Final price after tax and marginal
            };
          });
          setFiPrices(processedPrices);
          // Optionally, persist to localStorage
          localStorage.setItem('fiElectricityPrices', JSON.stringify(processedPrices));
        } else {
          setFiPrices([]);
        }
      } catch (err) {
        console.error("Error fetching electricity prices:", err);
        setFiPricesError(err.message || "An unexpected error occurred.");
      } finally {
        setFiPricesLoading(false);
      }
    };

    fetchElectricityPrices();
  }, []); // Run once on component mount

  return { fiPrices, fiPricesLoading, fiPricesError };
};

export default useElectricityData;
