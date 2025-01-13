// src/components/Modal/AddScenarioModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import styles from './Modal.module.css'; // Create this CSS module for styling
import { useMutation } from '@apollo/client';
import { CREATE_SCENARIO_MUTATION, GET_SCENARIOS } from '../../graphql/queries';

const AddScenarioModal = ({
  isOpen,
  onClose,
}) => {
  // Local state for form inputs
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');

  // Mutation hook
  const [createScenario, { data, loading, error }] = useMutation(CREATE_SCENARIO_MUTATION, {
    refetchQueries: [{ query: GET_SCENARIOS }], // Refetch scenarios after mutation
    awaitRefetchQueries: true,
  });

  // Local state for feedback messages
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous messages
    setSuccessMessage('');
    setValidationErrors([]);

    // Basic client-side validation
    if (!name.trim()) {
      alert('Please enter a scenario name.');
      return;
    }

    if (isNaN(weight) || parseFloat(weight) <= 0) {
      alert('Please enter a valid positive number for weight.');
      return;
    }

    try {
      // Execute the mutation
      const response = await createScenario({
        variables: {
          name: name.trim(),
          weight: parseFloat(weight),
        },
      });

      // Handle success
      if (response.data.createScenario.message) {
        setSuccessMessage(response.data.createScenario.message);
        // Optionally, reset form fields
        setName('');
        setWeight('');
        // Close the modal after a short delay
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 2000);
      } else {
        // Handle cases where message might be empty
        setSuccessMessage('Scenario created successfully!');
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      // Assuming the server returns validation errors in a specific format
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const gqlErrors = err.graphQLErrors.map((error) => error.message);
        setValidationErrors(gqlErrors);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setWeight('');
      setSuccessMessage('');
      setValidationErrors([]);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Add New Scenario</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Scenario Name */}
        <label className={styles.label}>
          Scenario Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
        </label>

        {/* Scenario Weight */}
        <label className={styles.label}>
          Scenario Weight:
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className={styles.input}
            step="0.01"
            min="0"
          />
        </label>

        {/* Display Validation Errors */}
        {validationErrors.length > 0 && (
          <div className={styles.error}>
            <h4>Validation Errors:</h4>
            <ul>
              {validationErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Display Success Message */}
        {successMessage && <p className={styles.success}>{successMessage}</p>}

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Submitting...' : 'Add Scenario'}
        </button>
      </form>
    </Modal>
  );
};

export default AddScenarioModal;
