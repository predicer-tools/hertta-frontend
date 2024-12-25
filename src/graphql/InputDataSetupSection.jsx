// src/graphql/InputDataSetupSection.jsx

import React, { useState } from 'react';
import { GRAPHQL_ENDPOINT, UPDATE_INPUT_DATA_SETUP_MUTATION } from './queries_old';

const InputDataSetupSection = () => {
  const [updateStatus, setUpdateStatus] = useState(null);

  const setupUpdate = {
    containsReserves: true,
    containsOnline: false,
    containsStates: false,
    containsPiecewiseEff: false,
    containsRisk: false,
    containsDiffusion: false,
    containsDelay: false,
    containsMarkets: false,
    reserveRealization: true,
    useMarketBids: true,
    commonTimesteps: 0,
    commonScenarioName: 'ALL',
    useNodeDummyVariables: true,
    useRampDummyVariables: true,
    nodeDummyVariableCost: 100000.0,
    rampDummyVariableCost: 100000.0,
  };

  const handleUpdateInputDataSetup = async () => {
    setUpdateStatus('Processing...');
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: UPDATE_INPUT_DATA_SETUP_MUTATION,
          variables: { setupUpdate },
        }),
      });

      const result = await response.json();
      if (result.data.updateInputDataSetup.errors.length > 0) {
        const errorMessages = result.data.updateInputDataSetup.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join(', ');
        setUpdateStatus(`Validation Errors: ${errorMessages}`);
      } else {
        setUpdateStatus('Input data setup updated successfully.');
      }
    } catch (error) {
      setUpdateStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section style={styles.section}>
      <h2>Update Input Data Setup</h2>
      <p>The setup will be updated with predefined values.</p>
      <button onClick={handleUpdateInputDataSetup} style={styles.button}>
        Update Setup
      </button>
      {updateStatus && <p>{updateStatus}</p>}
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

export default InputDataSetupSection;
