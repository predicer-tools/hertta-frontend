// src/graphql/ClearAllData.jsx

import React, { useState } from 'react';
import { CLEAR_INPUT_DATA_MUTATION, GRAPHQL_ENDPOINT } from './queries';

const ClearAllData = ({ onClearFrontendData, onRunNodeCreation }) => {
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleClearData = async () => {
    // Confirmation prompt to prevent accidental data loss
    const confirm = window.confirm('Are you sure you want to clear all data? This action cannot be undone.');
    if (!confirm) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: CLEAR_INPUT_DATA_MUTATION,
        }),
      });

      const result = await response.json();

      // Handle GraphQL errors
      if (result.errors) {
        setStatus('error');
        setErrorMessage(result.errors.map(err => err.message).join(', '));
        return;
      }

      // Handle mutation-specific errors
      if (result.data.clearInputData.error) {
        setStatus('error');
        setErrorMessage(result.data.clearInputData.error);
        return;
      }

      // If no errors, update the status to success
      setStatus('success');

      // Clear frontend data (nodes and diffusions)
      onClearFrontendData();

      // Optionally, run node creation automatically after clearing data
      const runNodes = window.confirm('Do you want to run node creation now?');
      if (runNodes) {
        onRunNodeCreation();
      }
    } catch (error) {
      // Handle network or unexpected errors
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Clear All Data</h2>
      <button
        onClick={handleClearData}
        style={styles.button}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Clearing...' : 'Clear All Data'}
      </button>
      {status === 'success' && (
        <p style={styles.success}>All data has been cleared successfully.</p>
      )}
      {status === 'error' && (
        <p style={styles.error}>Error: {errorMessage}</p>
      )}
    </div>
  );
};

// Inline styles for simplicity; you can adjust or use CSS classes as needed
const styles = {
  container: {
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    backgroundColor: '#f8d7da',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  success: {
    color: '#155724',
    marginTop: '10px',
  },
  error: {
    color: '#721c24',
    marginTop: '10px',
  },
};

export default ClearAllData;
