import React, { useState, useEffect } from "react";

const ElectricityPricesTest = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElectricityPrices = async () => {
      setLoading(true);
      setError(null);

      const apiUrl = "http://localhost:5000/api/electricity-prices"; // Backend route

      try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData); // Save raw data
      } catch (err) {
        console.error("Error fetching electricity prices:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchElectricityPrices();
  }, []);

  if (loading) {
    return <p>Loading electricity prices...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Electricity Prices Test</h2>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default ElectricityPricesTest;
