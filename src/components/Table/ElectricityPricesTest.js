import React, { useState, useEffect } from "react";

const ElectricityPricesTest = () => {
  const [fiPrices, setFiPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configurable constants for tax and marginal price
  const TAX_PERCENTAGE = 25.5; // 25.5% tax
  const MARGINAL_PRICE = 0.0; // 0.49 snt/kWh

  useEffect(() => {
    const fetchElectricityPrices = async () => {
      setLoading(true);
      setError(null);

      // Get current time in Finnish time (UTC+2)
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

      try {
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
        } else {
          setFiPrices([]);
        }
      } catch (err) {
        console.error("Error fetching electricity prices:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchElectricityPrices();
  }, []); // Run once on component mount

  if (loading) {
    return <p>Loading electricity prices...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Electricity Prices for FI (with Tax and Marginal)</h2>
      {fiPrices.length > 0 ? (
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Timestamp (Finnish Time)</th>
              <th>Final Price (c/kWh)</th>
            </tr>
          </thead>
          <tbody>
            {fiPrices.map((entry, index) => (
              <tr key={index}>
                <td>{entry.timestampLocal}</td>
                <td>{entry.finalPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No FI data available.</p>
      )}
    </div>
  );
};

export default ElectricityPricesTest;
