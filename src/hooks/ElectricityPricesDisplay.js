// src/components/ElectricityPricesDisplay.js

import React from 'react';
import useElectricityPrices from '../hooks/useElectricityPrices';

function ElectricityPricesDisplay() {
  const { fiPrices, loading, error } = useElectricityPrices();

  if (loading) {
    return <div>Loading electricity prices...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Finnish Electricity Prices</h2>
      <table>
        <thead>
          <tr>
            <th>Start Time (UTC)</th>
            <th>End Time (UTC)</th>
            <th>Price (€/MWh)</th>
          </tr>
        </thead>
        <tbody>
          {fiPrices.map((priceEntry, index) => (
            <tr key={index}>
              <td>{new Date(priceEntry.start).toLocaleString()}</td>
              <td>{new Date(priceEntry.end).toLocaleString()}</td>
              <td>{priceEntry.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ElectricityPricesDisplay;
