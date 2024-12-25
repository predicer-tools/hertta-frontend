// src/graphql/UpdateInputDataSetup.jsx

import React from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_INPUT_DATA_SETUP_MUTATION } from './queries';

const UpdateInputDataSetup = () => {
  // Define the setupUpdate object as per your requirements
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

  // useMutation hook to execute the mutation
  const [updateInputDataSetup, { data, loading, error }] = useMutation(
    UPDATE_INPUT_DATA_SETUP_MUTATION,
    {
      variables: { setupUpdate },
      onCompleted: (response) => {
        if (response.updateInputDataSetup.errors.length === 0) {
          alert('Input Data Setup updated successfully!');
          // Optionally, you can trigger a refetch or update the cache here
        } else {
          // Handle validation errors
          const errorMessages = response.updateInputDataSetup.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join('\n');
          alert(`Errors:\n${errorMessages}`);
        }
      },
      onError: (mutationError) => {
        // Handle unexpected errors (e.g., network issues)
        console.error('Mutation Error:', mutationError);
        alert('An unexpected error occurred while updating Input Data Setup.');
      },
    }
  );

  // Handler for button click
  const handleUpdate = () => {
    updateInputDataSetup();
  };

  return (
    <div style={styles.container}>
      <h2>Update Input Data Setup</h2>
      <button onClick={handleUpdate} disabled={loading} style={styles.button}>
        {loading ? 'Updating...' : 'Update Input Data Setup'}
      </button>

      {/* Optionally, display success or error messages */}
      {data && data.updateInputDataSetup.errors.length === 0 && (
        <p style={styles.success}>Update successful!</p>
      )}
      {error && <p style={styles.error}>Error: {error.message}</p>}
    </div>
  );
};

// Basic styling
const styles = {
  container: {
    margin: '20px 0',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    maxWidth: '400px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  success: {
    color: 'green',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default UpdateInputDataSetup;
