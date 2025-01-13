// src/components/Modal/NodeDelayModal.jsx

import React, { useState } from 'react';
import Modal from './Modal';
import { useMutation, useQuery } from '@apollo/client';
import { GET_NODE_NAMES, CREATE_NODE_DELAY_MUTATION } from '../../graphql/queries';

const NodeDelayModal = ({ isOpen, onClose }) => {
  // Fetch existing nodes
  const { data, loading, error } = useQuery(GET_NODE_NAMES);

  // State for form inputs
  const [fromNode, setFromNode] = useState('');
  const [toNode, setToNode] = useState('');
  const [delay, setDelay] = useState('');
  const [minDelayFlow, setMinDelayFlow] = useState('');
  const [maxDelayFlow, setMaxDelayFlow] = useState('');

  // Mutation for creating node delay
  const [createNodeDelay, { loading: mutationLoading, error: mutationError }] = useMutation(
    CREATE_NODE_DELAY_MUTATION,
    {
      onCompleted: (response) => {
        if (response.createNodeDelay.errors.length === 0) {
          alert('Node Delay created successfully!');
          handleClose();
        } else {
          // Handle validation errors
          const errorMessages = response.createNodeDelay.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join('\n');
          alert(`Errors:\n${errorMessages}`);
        }
      },
      onError: (error) => {
        console.error('Create Node Delay Mutation Error:', error);
        alert('An unexpected error occurred while creating the Node Delay.');
      },
    }
  );

  const handleClose = () => {
    // Reset form fields when closing
    setFromNode('');
    setToNode('');
    setDelay('');
    setMinDelayFlow('');
    setMaxDelayFlow('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!fromNode) {
      alert('Source Node is required.');
      return;
    }

    if (!toNode) {
      alert('Sink Node is required.');
      return;
    }

    if (fromNode === toNode) {
      alert('Source Node and Sink Node cannot be the same.');
      return;
    }

    if (!delay || !minDelayFlow || !maxDelayFlow) {
      alert('Please fill in all required delay fields.');
      return;
    }

    if (parseFloat(minDelayFlow) > parseFloat(maxDelayFlow)) {
      alert('Minimum Delay Flow cannot be greater than Maximum Delay Flow.');
      return;
    }

    // Prepare variables for mutation
    const variables = {
      delay: {
        fromNode,
        toNode,
        delay: parseFloat(delay),
        minDelayFlow: parseFloat(minDelayFlow),
        maxDelayFlow: parseFloat(maxDelayFlow),
      },
    };

    // Trigger the mutation
    createNodeDelay({ variables });
  };

  if (!isOpen) return null;

  if (loading) return <Modal isOpen={isOpen} onClose={handleClose}><p>Loading nodes...</p></Modal>;
  if (error) return <Modal isOpen={isOpen} onClose={handleClose}><p style={{ color: 'red' }}>Error loading nodes: {error.message}</p></Modal>;

  const nodeOptions = data.model.inputData.nodes.map((node) => (
    <option key={node.name} value={node.name}>
      {node.name}
    </option>
  ));

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2>Add New Node Delay</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Source Node:</label>
          <select
            value={fromNode}
            onChange={(e) => setFromNode(e.target.value)}
            required
            style={styles.select}
          >
            <option value="">Select Source Node</option>
            {nodeOptions}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Sink Node:</label>
          <select
            value={toNode}
            onChange={(e) => setToNode(e.target.value)}
            required
            style={styles.select}
          >
            <option value="">Select Sink Node</option>
            {nodeOptions}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Delay:</label>
          <input
            type="number"
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
            required
            style={styles.input}
            placeholder="e.g., 3.0"
            step="0.1"
            min="0"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Minimum Delay Flow:</label>
          <input
            type="number"
            value={minDelayFlow}
            onChange={(e) => setMinDelayFlow(e.target.value)}
            required
            style={styles.input}
            placeholder="e.g., 1.0"
            step="0.1"
            min="0"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Maximum Delay Flow:</label>
          <input
            type="number"
            value={maxDelayFlow}
            onChange={(e) => setMaxDelayFlow(e.target.value)}
            required
            style={styles.input}
            placeholder="e.g., 5.0"
            step="0.1"
            min="0"
          />
        </div>

        <button type="submit" disabled={mutationLoading} style={styles.submitButton}>
          {mutationLoading ? 'Creating...' : 'Create Node Delay'}
        </button>

        {/* Display mutation errors */}
        {mutationError && <p style={styles.error}>Error: {mutationError.message}</p>}
      </form>
    </Modal>
  );
};

// Basic styling
const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
    display: 'block',
  },
  input: {
    padding: '8px',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '8px',
    width: '100%',
    boxSizing: 'border-box',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default NodeDelayModal;
