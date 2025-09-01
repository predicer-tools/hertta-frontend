// src/graphql/MarketSection.jsx

import React, { useState } from 'react';
import { GRAPHQL_ENDPOINT, CREATE_MARKET_MUTATION } from './queries';

const MarketSection = () => {
  const [marketStatus, setMarketStatus] = useState(null);

  const npeMarket = {
    name: "npe",
    mType: "ENERGY",
    node: "electricitygrid",
    processGroup: "p1",
    direction: "UP_DOWN",
    realisation: 1.0,
    reserveType: null,
    isBid: true,
    isLimited: false,
    minBid: 0.0,
    maxBid: 0.0,
    fee: 0.0,
    price: 0.0,
    upPrice: null,
    downPrice: null,
    reserveActivationPrice: null
  };

  const handleCreateMarket = async () => {
    setMarketStatus('Processing...');
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: CREATE_MARKET_MUTATION,
          variables: { market: npeMarket },
        }),
      });

      const result = await response.json();
      if (result.data.createMarket.errors.length > 0) {
        const errorMessages = result.data.createMarket.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join(', ');
        setMarketStatus(`Validation Errors: ${errorMessages}`);
      } else {
        setMarketStatus('Market created successfully.');
      }
    } catch (error) {
      setMarketStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section style={styles.section}>
      <h2>Create Predefined Market</h2>
      <button onClick={handleCreateMarket} style={styles.button}>
        Add Predefined Market
      </button>
      {marketStatus && <p>{marketStatus}</p>}
    </section>
  );
};

const styles = {
  section: {
    marginBottom: '40px',
    border: '1px solid #ccc',
    padding: '20px',
    borderRadius: '8px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#FFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default MarketSection;
