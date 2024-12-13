// src/graphql/ClearInputDataSection.jsx

import React, { useState } from 'react';
import { GRAPHQL_ENDPOINT, CLEAR_INPUT_DATA_MUTATION } from '../graphql/queries';

const ClearInputDataSection = () => {
  const [clearStatus, setClearStatus] = useState(null);

  const handleClearInputData = async () => {
    setClearStatus('Processing...');
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: CLEAR_INPUT_DATA_MUTATION }),
      });

      const result = await response.json();
      if (result.data.clearInputData.error) {
        setClearStatus(`Error: ${result.data.clearInputData.error}`);
      } else {
        setClearStatus('Input data cleared successfully.');
      }
    } catch (error) {
      setClearStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section style={styles.section}>
      <h2>Clear Input Data</h2>
      <button onClick={handleClearInputData} style={styles.button}>
        Clear Input Data
      </button>
      {clearStatus && <p>{clearStatus}</p>}
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

export default ClearInputDataSection;
