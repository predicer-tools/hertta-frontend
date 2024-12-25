// src/graphql/AddProcess.jsx

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PROCESS_MUTATION } from './queries_old'; // Ensure the path is correct

const AddProcess = () => {
  // State for user inputs: 'name' and 'eff'
  const [processData, setProcessData] = useState({
    name: '',
    eff: '',
  });

  // State for handling errors
  const [errors, setErrors] = useState([]);

  // useMutation hook for creating a process
  const [createProcess, { loading, error }] = useMutation(CREATE_PROCESS_MUTATION, {
    onCompleted: (data) => {
      if (data.createProcess.errors && data.createProcess.errors.length > 0) {
        // If there are validation errors, display them
        setErrors(data.createProcess.errors);
      } else {
        // Reset form fields upon successful creation
        setProcessData({
          name: '',
          eff: '',
        });
        setErrors([]);
        alert('Process created successfully!');
        // Trigger data refresh in parent components (if necessary)
        window.dispatchEvent(new Event('dataChanged'));
      }
    },
    onError: (err) => {
      // Handle unexpected errors (e.g., network issues)
      console.error('Mutation error:', err);
      setErrors([{ field: 'general', message: 'An unexpected error occurred.' }]);
    },
  });

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProcessData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Construct the input object with default values for non-user fields
    const input = {
      name: processData.name,
      eff: parseFloat(processData.eff), // Convert 'eff' to Float
      conversion: 1.0, // Default value
      isCfFix: false, // Default value
      isOnline: false, // Default value
      isRes: false, // Default value
      loadMin: 0.0, // Default value
      loadMax: 0.0, // Default value
      startCost: 0.0, // Default value
      minOnline: 0.0, // Default value
      maxOnline: 0.0, // Default value
      minOffline: 0.0, // Default value
      maxOffline: 0.0, // Default value
      initialState: false, // Default value
      isScenarioIndependent: false, // Default value
      cf: 0.0, // Default value (or null if allowed)
      effTs: 0.0, // Default value
    };

    // Execute the mutation with the constructed input
    createProcess({
      variables: {
        process: input,
      },
    });
  };

  return (
    <div>
      <h2>Add New Process</h2>
      <form onSubmit={handleSubmit}>
        {/* Name Input */}
        <div>
          <label htmlFor="name">Name:</label><br />
          <input
            type="text"
            id="name"
            name="name"
            value={processData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Efficiency Input */}
        <div>
          <label htmlFor="eff">Efficiency:</label><br />
          <input
            type="number"
            id="eff"
            name="eff"
            value={processData.eff}
            onChange={handleChange}
            required
            step="0.01"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Process'}
        </button>
      </form>

      {/* Display Unexpected Error */}
      {error && <p style={{ color: 'red' }}>An unexpected error occurred.</p>}

      {/* Display Validation Errors */}
      {errors.length > 0 && (
        <div style={{ color: 'red' }}>
          <h3>Errors:</h3>
          <ul>
            {errors.map((err, index) => (
              <li key={index}>
                {err.field}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AddProcess;
