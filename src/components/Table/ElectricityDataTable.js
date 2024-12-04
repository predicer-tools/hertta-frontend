import React from 'react';

const ElectricityDataTable = ({ electricityPrices }) => {
  if (!electricityPrices || electricityPrices.length === 0) {
    return <p>No electricity price data available.</p>;
  }

  return (
    <div>
      <h2>Electricity Prices (FI)</h2>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Start Time (UTC)</th>
            <th>End Time (UTC)</th>
            <th>Price (€/MWh)</th>
          </tr>
        </thead>
        <tbody>
          {electricityPrices.map((entry, index) => (
            <tr key={index}>
              <td>{entry.start}</td>
              <td>{entry.end}</td>
              <td>{entry.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ElectricityDataTable;
