// src/components/Modal/AddMarketModal.jsx

import React, { useState } from 'react';
import Modal from './Modal';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_MARKET_MUTATION, GET_NODE_NAMES_QUERY } from '../../graphql/queries.js'; // Adjust the import path as needed

const AddMarketModal = ({ isOpen, onClose }) => {
  // Initialize form state
  const [marketForm, setMarketForm] = useState({
    name: '',
    mType: 'ENERGY', // Default value
    processGroup: '',
    direction: 'UP_DOWN', // Default value
    realisation: 1.0,
    reserveType: '',
    isBid: true,
    isLimited: false,
    minBid: 10.0,
    maxBid: 100.0,
    fee: 5.0,
    price: 30.0,
    upPrice: 35.0,
    downPrice: 25.0,
    reserveActivationPrice: 45.0,
    node: '', // Single node
  });

  // Fetch existing nodes
  const { data: nodeData, loading: nodeLoading, error: nodeError } = useQuery(GET_NODE_NAMES_QUERY, {
    skip: !isOpen, // Only fetch when the modal is open
  });
  const nodes = nodeData?.model?.inputData?.nodes || [];

  // Handle input changes for all fields except node
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMarketForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle node selection
  const handleNodeChange = (e) => {
    const selectedNode = e.target.value;
    setMarketForm((prev) => ({
      ...prev,
      node: selectedNode,
    }));
  };

  // GraphQL mutation hook
  const [createMarket, { loading, error }] = useMutation(CREATE_MARKET_MUTATION, {
    variables: { market: marketForm },
    onCompleted: (response) => {
      if (response.createMarket.errors.length === 0) {
        alert('Market created successfully!');
        onClose(); // Close the modal
        // Reset the form
        setMarketForm({
          name: '',
          mType: 'ENERGY',
          processGroup: '',
          direction: 'UP_DOWN',
          realisation: 1.0,
          reserveType: '',
          isBid: true,
          isLimited: false,
          minBid: 10.0,
          maxBid: 100.0,
          fee: 5.0,
          price: 30.0,
          upPrice: 35.0,
          downPrice: 25.0,
          reserveActivationPrice: 45.0,
          node: '',
        });
        // Refetch markets to update UI
      } else {
        // Handle validation errors
        const errorMessages = response.createMarket.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('\n');
        alert(`Errors:\n${errorMessages}`);
      }
    },
    onError: (mutationError) => {
      // Handle unexpected errors (e.g., network issues)
      console.error('Create Market Mutation Error:', mutationError);
      alert('An unexpected error occurred while creating the market.');
    },
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    createMarket();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Add New Market</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Market Name */}
        <label style={styles.label}>
          Market Name:
          <input
            type="text"
            name="name"
            value={marketForm.name}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Enter Market Name"
          />
        </label>

        {/* Market Type */}
        <label style={styles.label}>
          Market Type:
          <select
            name="mType"
            value={marketForm.mType}
            onChange={handleChange}
            required
            style={styles.select}
          >
            <option value="ENERGY">Energy</option>
            <option value="RESERVE">Reserve</option>
          </select>
        </label>

        {/* Process Group */}
        <label style={styles.label}>
          Process Group:
          <input
            type="text"
            name="processGroup"
            value={marketForm.processGroup}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Enter Process Group"
          />
        </label>

        {/* Direction */}
        <label style={styles.label}>
          Direction:
          <select
            name="direction"
            value={marketForm.direction}
            onChange={handleChange}
            required
            style={styles.select}
          >
            <option value="UP">Up</option>
            <option value="DOWN">Down</option>
            <option value="UP_DOWN">Up & Down</option>
          </select>
        </label>

        {/* Realisation */}
        <label style={styles.label}>
          Realisation:
          <input
            type="number"
            name="realisation"
            value={marketForm.realisation}
            onChange={handleChange}
            step="0.1"
            min="0"
            required
            style={styles.input}
            placeholder="Enter Realisation"
          />
        </label>

        {/* Reserve Type */}
        <label style={styles.label}>
          Reserve Type:
          <input
            type="text"
            name="reserveType"
            value={marketForm.reserveType}
            onChange={handleChange}
            style={styles.input}
            placeholder="Enter Reserve Type (Optional)"
          />
        </label>

        {/* Is Bid */}
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isBid"
            checked={marketForm.isBid}
            onChange={handleChange}
            style={styles.checkbox}
          />
          Is Bid
        </label>

        {/* Is Limited */}
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isLimited"
            checked={marketForm.isLimited}
            onChange={handleChange}
            style={styles.checkbox}
          />
          Is Limited
        </label>

        {/* Min Bid */}
        <label style={styles.label}>
          Min Bid:
          <input
            type="number"
            name="minBid"
            value={marketForm.minBid}
            onChange={handleChange}
            step="0.1"
            min="0"
            required
            style={styles.input}
            placeholder="Enter Minimum Bid"
          />
        </label>

        {/* Max Bid */}
        <label style={styles.label}>
          Max Bid:
          <input
            type="number"
            name="maxBid"
            value={marketForm.maxBid}
            onChange={handleChange}
            step="0.1"
            min="0"
            required
            style={styles.input}
            placeholder="Enter Maximum Bid"
          />
        </label>

        {/* Fee */}
        <label style={styles.label}>
          Fee:
          <input
            type="number"
            name="fee"
            value={marketForm.fee}
            onChange={handleChange}
            step="0.1"
            min="0"
            required
            style={styles.input}
            placeholder="Enter Fee"
          />
        </label>

        {/* Price */}
        <label style={styles.label}>
          Price:
          <input
            type="number"
            name="price"
            value={marketForm.price}
            onChange={handleChange}
            step="0.1"
            min="0"
            required
            style={styles.input}
            placeholder="Enter Price"
          />
        </label>

        {/* Up Price */}
        <label style={styles.label}>
          Up Price:
          <input
            type="number"
            name="upPrice"
            value={marketForm.upPrice}
            onChange={handleChange}
            step="0.1"
            min="0"
            required
            style={styles.input}
            placeholder="Enter Up Price"
          />
        </label>

        {/* Down Price */}
        <label style={styles.label}>
          Down Price:
          <input
            type="number"
            name="downPrice"
            value={marketForm.downPrice}
            onChange={handleChange}
            step="0.1"
            min="0"
            required
            style={styles.input}
            placeholder="Enter Down Price"
          />
        </label>

        {/* Reserve Activation Price */}
        <label style={styles.label}>
          Reserve Activation Price:
          <input
            type="number"
            name="reserveActivationPrice"
            value={marketForm.reserveActivationPrice}
            onChange={handleChange}
            step="0.1"
            min="0"
            required
            style={styles.input}
            placeholder="Enter Reserve Activation Price"
          />
        </label>

        {/* Node Selection */}
        <label style={styles.label}>
          Select Node:
          {nodeLoading ? (
            <p>Loading nodes...</p>
          ) : nodeError ? (
            <p style={styles.error}>Error loading nodes: {nodeError.message}</p>
          ) : (
            <select
              name="node"
              value={marketForm.node}
              onChange={handleNodeChange}
              required
              style={styles.select}
            >
              <option value="" disabled>
                -- Select a Node --
              </option>
              {nodes.map((node) => (
                <option key={node.name} value={node.name}>
                  {node.name}
                </option>
              ))}
            </select>
          )}
        </label>

        {/* Submit Button */}
        <button type="submit" disabled={loading} style={styles.submitButton}>
          {loading ? 'Creating...' : 'Create Market'}
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
    marginBottom: '10px',
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
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  checkbox: {
    marginRight: '10px',
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
    marginTop: '10px',
  },
};

export default AddMarketModal;
