import React from 'react';
import styles from './WeatherDataTable.module.css';

/**
 * Component to display electricity prices in a table.
 *
 * @param {Array} fiPrices - Array of electricity price data.
 * @param {boolean} loading - Whether the data is loading.
 * @param {string|null} error - Any error message.
 */
const ElectricityPricesTable = ({ fiPrices, loading, error }) => {
  if (loading) {
    return <p>Loading electricity prices...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!fiPrices || fiPrices.length === 0) {
    return <p>No FI electricity price data available.</p>;
  }

  return (
    <div className={styles.tableWrapper}>
      <h3>Electricity Prices</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Price (c/kWh)</th>
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
    </div>
  );
};

export default ElectricityPricesTable;
