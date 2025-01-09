// src/components/Modal/StateModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import styles from './Modal.module.css'; // Ensure you have this CSS module for styling
import { useMutation } from '@apollo/client';
import { SET_NODE_STATE_MUTATION, UPDATE_NODE_STATE_MUTATION } from '../../graphql/queries';

const StateModal = ({
  isOpen,
  onClose,
  nodes, // Array of node objects with 'name' property
}) => {
  // Local state for form inputs
  const [nodeName, setNodeName] = useState('');
  const [inMax, setInMax] = useState('');
  const [outMax, setOutMax] = useState('');
  const [stateLossProportional, setStateLossProportional] = useState('');
  const [stateMin, setStateMin] = useState('');
  const [stateMax, setStateMax] = useState('');
  const [initialState, setInitialState] = useState('');
  const [isScenarioIndependent, setIsScenarioIndependent] = useState(false);
  const [isTemp, setIsTemp] = useState(false);
  const [tEConversion, setTEConversion] = useState('');
  const [residualValue, setResidualValue] = useState('');

  // Mutation hooks
  const [setNodeState, { data: setData, loading: setLoading, error: setError }] = useMutation(SET_NODE_STATE_MUTATION, {
    refetchQueries: ['GetNodeNames'], // Ensure the query name matches
  });

  const [updateNodeState, { data: updateData, loading: updateLoading, error: updateError }] = useMutation(UPDATE_NODE_STATE_MUTATION, {
    refetchQueries: ['GetNodeNames'],
  });

  // Local state for feedback messages
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous messages
    setSuccessMessage('');
    setValidationErrors([]);

    // Validate required fields
    if (!nodeName) {
      alert('Please select a node.');
      return;
    }

    // Prepare the state input
    const stateInput = {
      inMax: parseFloat(inMax),
      outMax: parseFloat(outMax),
      stateLossProportional: parseFloat(stateLossProportional),
      stateMin: parseFloat(stateMin),
      stateMax: parseFloat(stateMax),
      initialState: parseFloat(initialState),
      isScenarioIndependent,
      isTemp,
      tEConversion: parseFloat(tEConversion),
      residualValue: parseFloat(residualValue),
    };

    try {
      // Execute the mutation
      const response = await setNodeState({
        variables: {
          state: stateInput,
          nodeName,
        },
      });

      // Check for validation errors
      if (response.data.setNodeState.errors.length === 0) {
        setSuccessMessage('State set successfully!');
        // Optionally, reset form fields
        setNodeName('');
        setInMax('');
        setOutMax('');
        setStateLossProportional('');
        setStateMin('');
        setStateMax('');
        setInitialState('');
        setIsScenarioIndependent(false);
        setIsTemp(false);
        setTEConversion('');
        setResidualValue('');
        // Close the modal after a delay
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 2000);
      } else {
        // Handle validation errors
        setValidationErrors(response.data.setNodeState.errors);
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    }
  };

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setNodeName('');
      setInMax('');
      setOutMax('');
      setStateLossProportional('');
      setStateMin('');
      setStateMax('');
      setInitialState('');
      setIsScenarioIndependent(false);
      setIsTemp(false);
      setTEConversion('');
      setResidualValue('');
      setSuccessMessage('');
      setValidationErrors([]);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Create and Assign State to Node</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Node Selection */}
        <label className={styles.label}>
          Select Node:
          <select
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            required
            className={styles.select}
          >
            <option value="">--Select a Node--</option>
            {nodes.map((node) => (
              <option key={node.name} value={node.name}>
                {node.name}
              </option>
            ))}
          </select>
        </label>

        {/* State Fields */}
        <label className={styles.label}>
          In Max:
          <input
            type="number"
            value={inMax}
            onChange={(e) => setInMax(e.target.value)}
            required
            className={styles.input}
            step="0.01"
          />
        </label>

        <label className={styles.label}>
          Out Max:
          <input
            type="number"
            value={outMax}
            onChange={(e) => setOutMax(e.target.value)}
            required
            className={styles.input}
            step="0.01"
          />
        </label>

        <label className={styles.label}>
          State Loss Proportional:
          <input
            type="number"
            value={stateLossProportional}
            onChange={(e) => setStateLossProportional(e.target.value)}
            required
            className={styles.input}
            step="0.01"
          />
        </label>

        <label className={styles.label}>
          State Min:
          <input
            type="number"
            value={stateMin}
            onChange={(e) => setStateMin(e.target.value)}
            required
            className={styles.input}
            step="0.01"
          />
        </label>

        <label className={styles.label}>
          State Max:
          <input
            type="number"
            value={stateMax}
            onChange={(e) => setStateMax(e.target.value)}
            required
            className={styles.input}
            step="0.01"
          />
        </label>

        <label className={styles.label}>
          Initial State:
          <input
            type="number"
            value={initialState}
            onChange={(e) => setInitialState(e.target.value)}
            required
            className={styles.input}
            step="0.01"
          />
        </label>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isScenarioIndependent}
            onChange={(e) => setIsScenarioIndependent(e.target.checked)}
            className={styles.checkbox}
          />
          Is Scenario Independent
        </label>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isTemp}
            onChange={(e) => setIsTemp(e.target.checked)}
            className={styles.checkbox}
          />
          Is Temporary
        </label>

        <label className={styles.label}>
          TE Conversion:
          <input
            type="number"
            value={tEConversion}
            onChange={(e) => setTEConversion(e.target.value)}
            required
            className={styles.input}
            step="0.01"
          />
        </label>

        <label className={styles.label}>
          Residual Value:
          <input
            type="number"
            value={residualValue}
            onChange={(e) => setResidualValue(e.target.value)}
            required
            className={styles.input}
            step="0.01"
          />
        </label>

        {/* Display Validation Errors */}
        {validationErrors.length > 0 && (
          <div className={styles.error}>
            <h4>Validation Errors:</h4>
            <ul>
              {validationErrors.map((err, index) => (
                <li key={index}>
                  <strong>{err.field}</strong>: {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Display Success Message */}
        {successMessage && <p className={styles.success}>{successMessage}</p>}

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton} disabled={setLoading || updateLoading}>
          {setLoading || updateLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </Modal>
  );
};

export default StateModal;
