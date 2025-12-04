// src/graphql/RiskSection.jsx

import React, { useState } from 'react';
import { GRAPHQL_ENDPOINT, CREATE_RISK_MUTATION } from './queries';

const RiskSection = () => {
  const [riskStatus, setRiskStatus] = useState(null);

  const predefinedRisk = {
    parameter: "alfa",
    value: 0.1
  };

  const handleCreateRisk = async () => {
    setRiskStatus('Processing...');
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: CREATE_RISK_MUTATION,
          variables: { risk: predefinedRisk },
        }),
      });

      const result = await response.json();

      // Check if there are validation errors
      if (result.data.createRisk.errors.length > 0) {
        const errorMessages = result.data.createRisk.errors
          .map(err => `${err.field}: ${err.message}`)
          .join(', ');
        setRiskStatus(`Validation Errors: ${errorMessages}`);
      } else {
        setRiskStatus('Risk "alfa" created successfully.');
      }
    } catch (error) {
      setRiskStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section style={styles.section}>
      <h2>Create Risk "alfa"</h2>
      <button onClick={handleCreateRisk} style={styles.button}>
        Add Risk "alfa"
      </button>
      {riskStatus && <p>{riskStatus}</p>}
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

export default RiskSection;
