// src/components/Modal/AddNodeDiffusionModal.jsx

import React, { useState } from 'react';
import Modal from './Modal'; // Ensure this path is correct
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_NODE_DIFFUSION_MUTATION, GET_NODE_NAMES, GET_NODE_DIFFUSIONS } from '../../graphql/queries'; // Adjust the import path as needed

const AddNodeDiffusionModal = ({ isOpen, onClose }) => {
  // Initialize form state
  const [diffusionForm, setDiffusionForm] = useState({
    fromNode: '',
    toNode: '',
    coefficient: 1.0,
  });

  // Fetch existing nodes
  const { data: nodeData, loading: nodeLoading, error: nodeError } = useQuery(GET_NODE_NAMES, {
    skip: !isOpen, // Only fetch when the modal is open
  });
  const nodes = nodeData?.model?.inputData?.nodes || [];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDiffusionForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // GraphQL mutation hook
  const [createNodeDiffusion, { loading, error }] = useMutation(CREATE_NODE_DIFFUSION_MUTATION, {
    variables: { 
      fromNode: diffusionForm.fromNode, 
      toNode: diffusionForm.toNode, 
      coefficient: parseFloat(diffusionForm.coefficient) 
    },
    onCompleted: (response) => {
      if (response.createNodeDiffusion.errors.length === 0) {
        alert('Node Diffusion created successfully!');
        onClose(); // Close the modal
        // Optionally, reset the form
        setDiffusionForm({
          fromNode: '',
          toNode: '',
          coefficient: 1.0,
        });
      } else {
        // Handle validation errors
        const errorMessages = response.createNodeDiffusion.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('\n');
        alert(`Errors:\n${errorMessages}`);
      }
    },
    onError: (mutationError) => {
      // Handle unexpected errors (e.g., network issues)
      console.error('Create Node Diffusion Mutation Error:', mutationError);
      alert('An unexpected error occurred while creating the Node Diffusion.');
    },
    refetchQueries: [{ query: GET_NODE_DIFFUSIONS }], // Refetch node diffusions if needed
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (diffusionForm.fromNode === diffusionForm.toNode) {
      alert('From Node and To Node cannot be the same.');
      return;
    }

    if (!diffusionForm.fromNode || !diffusionForm.toNode) {
      alert('Please select both From Node and To Node.');
      return;
    }

    if (diffusionForm.coefficient <= 0) {
      alert('Coefficient must be a positive number.');
      return;
    }

    createNodeDiffusion();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Add Node Diffusion</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* From Node Selection */}
        <label style={styles.label}>
          From Node:
          {nodeLoading ? (
            <p>Loading nodes...</p>
          ) : nodeError ? (
            <p style={styles.error}>Error loading nodes: {nodeError.message}</p>
          ) : (
            <select
              name="fromNode"
              value={diffusionForm.fromNode}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="" disabled>
                -- Select From Node --
              </option>
              {nodes.map((node) => (
                <option key={node.name} value={node.name}>
                  {node.name}
                </option>
              ))}
            </select>
          )}
        </label>

        {/* To Node Selection */}
        <label style={styles.label}>
          To Node:
          {nodeLoading ? (
            <p>Loading nodes...</p>
          ) : nodeError ? (
            <p style={styles.error}>Error loading nodes: {nodeError.message}</p>
          ) : (
            <select
              name="toNode"
              value={diffusionForm.toNode}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="" disabled>
                -- Select To Node --
              </option>
              {nodes.map((node) => (
                <option key={node.name} value={node.name}>
                  {node.name}
                </option>
              ))}
            </select>
          )}
        </label>

        {/* Coefficient Input */}
        <label style={styles.label}>
          Coefficient:
          <input
            type="number"
            name="coefficient"
            value={diffusionForm.coefficient}
            onChange={handleChange}
            step="0.1"
            min="0.1"
            required
            style={styles.input}
            placeholder="Enter Coefficient"
          />
        </label>

        {/* Submit Button */}
        <button type="submit" disabled={loading} style={styles.submitButton}>
          {loading ? 'Creating...' : 'Create Node Diffusion'}
        </button>

        {/* Display Errors */}
        {error && <p style={styles.error}>Error: {error.message}</p>}
      </form>
    </Modal>
  );
};

// Basic styling (you can move these to a CSS module or styled-components)
const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '10px',
  },
  label: {
    marginBottom: '15px',
    fontWeight: 'bold',
    display: 'block',
  },
  input: {
    padding: '8px',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '5px',
  },
  select: {
    padding: '8px',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '5px',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    marginTop: '5px',
  },
};

export default AddNodeDiffusionModal;
