// src/components/Modal/NodeHistoryModal.jsx

import React, { useState } from 'react';
import Modal from './Modal';
import { useMutation, useQuery } from '@apollo/client';
import { GET_NODE_NAMES, CREATE_NODE_HISTORY_MUTATION } from '../../graphql/queries';

const NodeHistoryModal = ({ isOpen, onClose }) => {
  // Fetch existing nodes
  const { data, loading, error } = useQuery(GET_NODE_NAMES);

  // State for form input
  const [selectedNode, setSelectedNode] = useState('');

  // Mutation for creating node history
  const [createNodeHistory, { loading: mutationLoading, error: mutationError }] = useMutation(
    CREATE_NODE_HISTORY_MUTATION,
    {
      onCompleted: (response) => {
        if (response.createNodeHistory.errors.length === 0) {
          alert(`Node history created successfully for node "${selectedNode}"!`);
          handleClose();
        } else {
          // Handle validation errors
          const errorMessages = response.createNodeHistory.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join('\n');
          alert(`Errors:\n${errorMessages}`);
        }
      },
      onError: (error) => {
        console.error('Create Node History Mutation Error:', error);
        alert('An unexpected error occurred while creating the Node History.');
      },
    }
  );

  const handleClose = () => {
    // Reset form fields when closing
    setSelectedNode('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedNode) {
      alert('Please select a node.');
      return;
    }

    // Execute the mutation with the selected node name
    createNodeHistory({ variables: { nodeName: selectedNode } });
  };

  if (!isOpen) return null;

  if (loading)
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <p>Loading nodes...</p>
      </Modal>
    );

  if (error)
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <p style={{ color: 'red' }}>Error loading nodes: {error.message}</p>
      </Modal>
    );

  const nodeOptions = data.model.inputData.nodes.map((node) => (
    <option key={node.name} value={node.name}>
      {node.name}
    </option>
  ));

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2>Create Node History</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Select Node:</label>
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            required
            style={styles.select}
          >
            <option value="">-- Select a Node --</option>
            {nodeOptions}
          </select>
        </div>

        <button type="submit" disabled={mutationLoading} style={styles.submitButton}>
          {mutationLoading ? 'Creating...' : 'Create Node History'}
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

export default NodeHistoryModal;
