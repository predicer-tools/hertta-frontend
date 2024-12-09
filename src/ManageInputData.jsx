// src/pages/ManageInputData.jsx

import React, { useState } from 'react';

// Define the GraphQL endpoint
const GRAPHQL_ENDPOINT = 'http://localhost:3030/graphql';

// GraphQL mutation to clear input data
const CLEAR_INPUT_DATA_MUTATION = `
  mutation ClearInputData {
    clearInputData {
      error
    }
  }
`;

// GraphQL mutation to update input data setup
const UPDATE_INPUT_DATA_SETUP_MUTATION = `
  mutation UpdateInputDataSetup($setupUpdate: InputDataSetupUpdate!) {
    updateInputDataSetup(setupUpdate: $setupUpdate) {
      errors {
        field
        message
      }
    }
  }
`;

const ManageInputData = () => {
  // State for feedback messages
  const [clearStatus, setClearStatus] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);

  // State for the input data setup form
  const [setupUpdate, setSetupUpdate] = useState({
    containsReserves: false,
    containsOnline: false,
    containsStates: false,
    containsPiecewiseEff: false,
    containsRisk: false,
    containsDiffusion: false,
    containsDelay: false,
    containsMarkets: false,
    reserveRealization: false,
    useMarketBids: false,
    commonTimesteps: 0,
    commonScenarioName: '',
    useNodeDummyVariables: false,
    useRampDummyVariables: false,
    nodeDummyVariableCost: 0.0,
    rampDummyVariableCost: 0.0,
  });

  // Handler for clearing input data
  const handleClearInputData = async () => {
    setClearStatus('Processing...');
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: CLEAR_INPUT_DATA_MUTATION,
        }),
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

  // Handler for updating input data setup
  const handleUpdateInputDataSetup = async (e) => {
    e.preventDefault();
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

  // Handler for form input changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setSetupUpdate((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? parseFloat(value)
          : value,
    }));
  };

  return (
    <div style={styles.container}>
      <h1>Manage Input Data</h1>

      {/* Clear Input Data Section */}
      <section style={styles.section}>
        <h2>Clear Input Data</h2>
        <button onClick={handleClearInputData} style={styles.button}>
          Clear Input Data
        </button>
        {clearStatus && <p>{clearStatus}</p>}
      </section>

      {/* Update Input Data Setup Section */}
      <section style={styles.section}>
        <h2>Update Input Data Setup</h2>
        <form onSubmit={handleUpdateInputDataSetup} style={styles.form}>
          {/* Boolean Fields */}
          {[
            'containsReserves',
            'containsOnline',
            'containsStates',
            'containsPiecewiseEff',
            'containsRisk',
            'containsDiffusion',
            'containsDelay',
            'containsMarkets',
            'reserveRealization',
            'useMarketBids',
            'useNodeDummyVariables',
            'useRampDummyVariables',
          ].map((field) => (
            <div key={field} style={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name={field}
                  checked={setupUpdate[field]}
                  onChange={handleChange}
                />
                {formatFieldName(field)}
              </label>
            </div>
          ))}

          {/* Integer and Float Fields */}
          <div style={styles.formGroup}>
            <label>
              Common Timesteps:
              <input
                type="number"
                name="commonTimesteps"
                value={setupUpdate.commonTimesteps}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </label>
          </div>
          <div style={styles.formGroup}>
            <label>
              Common Scenario Name:
              <input
                type="text"
                name="commonScenarioName"
                value={setupUpdate.commonScenarioName}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </label>
          </div>
          <div style={styles.formGroup}>
            <label>
              Node Dummy Variable Cost:
              <input
                type="number"
                step="0.01"
                name="nodeDummyVariableCost"
                value={setupUpdate.nodeDummyVariableCost}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </label>
          </div>
          <div style={styles.formGroup}>
            <label>
              Ramp Dummy Variable Cost:
              <input
                type="number"
                step="0.01"
                name="rampDummyVariableCost"
                value={setupUpdate.rampDummyVariableCost}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </label>
          </div>

          <button type="submit" style={styles.button}>
            Update Setup
          </button>
        </form>
        {updateStatus && <p>{updateStatus}</p>}
      </section>
    </div>
  );
};

// Helper function to format field names (e.g., containsReserves -> Contains Reserves)
const formatFieldName = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

// Simple styling for the component
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '500px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    marginLeft: '10px',
    padding: '5px',
    width: '100%',
    boxSizing: 'border-box',
  },
};

export default ManageInputData;
